# backend/app/api/v1/endpoints/files.py

import os
import uuid
import json
import shutil
import logging
from datetime import datetime
from pathlib import Path
from typing import List
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from ....core.config import settings
from ....services.data_processing import process_file
from ....utils.file_validator import validate_file_content

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()


def get_file_mapping():
    """Get or create the file ID mapping."""
    mapping_file = settings.UPLOAD_DIR / "file_mapping.json"
    if mapping_file.exists():
        with open(mapping_file, "r") as f:
            return json.load(f)
    return {}


def save_file_mapping(mapping):
    """Save the file ID mapping."""
    mapping_file = settings.UPLOAD_DIR / "file_mapping.json"
    with open(mapping_file, "w") as f:
        json.dump(mapping, f, indent=2)


@router.post("/upload")
async def upload_file(
    background_tasks: BackgroundTasks, file: UploadFile = File(...)
) -> JSONResponse:
    """Upload a drone data file (CSV or JSON)."""
    try:
        # Log file details
        logger.debug(f"Received file: {file.filename}")
        logger.debug(f"Content type: {file.content_type}")

        # Validate file content
        is_valid, error_message = await validate_file_content(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)

        # Generate IDs and paths
        file_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        original_filename = file.filename
        save_filename = f"{timestamp}_{original_filename}"
        file_path = settings.UPLOAD_DIR / save_filename

        # Ensure upload directory exists
        settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        logger.debug(f"Saving file to: {file_path}")

        # Save file using chunks
        with open(file_path, "wb") as buffer:
            while True:
                chunk = await file.read(8192)  # 8KB chunks
                if not chunk:
                    break
                buffer.write(chunk)

        # Verify the saved file
        if not file_path.exists():
            logger.error(f"File not found after saving: {file_path}")
            raise HTTPException(status_code=500, detail="Failed to save file")

        saved_size = file_path.stat().st_size
        logger.debug(f"Saved file size: {saved_size} bytes")

        if saved_size == 0:
            logger.error("Saved file is empty")
            file_path.unlink()  # Delete empty file
            raise HTTPException(status_code=500, detail="Failed to save file content")

        # Update file mapping
        mapping = get_file_mapping()
        mapping[file_id] = {
            "filename": original_filename,
            "timestamp": datetime.now().isoformat(),
            "path": str(file_path),
            "id": file_id,
            "status": "pending",
            "size": saved_size,
        }
        save_file_mapping(mapping)

        # Start background processing
        background_tasks.add_task(process_file, file_id, str(file_path))

        return JSONResponse(
            status_code=200,
            content={
                "id": file_id,
                "filename": original_filename,
                "timestamp": mapping[file_id]["timestamp"],
                "status": "success",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while uploading the file: {str(e)}",
        )


@router.get("/")
async def list_files() -> List[dict]:
    """List all uploaded files."""
    try:
        mapping = get_file_mapping()
        files = []

        for file_id, file_info in mapping.items():
            file_path = Path(file_info["path"])
            if file_path.exists() and file_path.stat().st_size > 0:
                files.append(
                    {
                        "id": file_id,
                        "filename": file_info["filename"],
                        "timestamp": file_info["timestamp"],
                        "status": file_info.get("status", "success"),
                    }
                )

        files.sort(key=lambda x: x["timestamp"], reverse=True)
        return files

    except Exception as e:
        logger.error(f"Error listing files: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"An error occurred while listing files: {str(e)}"
        )


@router.get("/{file_id}")
async def get_file_info(file_id: str):
    """Get information about a specific file."""
    try:
        mapping = get_file_mapping()
        if file_id not in mapping:
            raise HTTPException(status_code=404, detail="File not found")

        file_info = mapping[file_id]
        file_path = Path(file_info["path"])

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        return {
            "id": file_id,
            "filename": file_info["filename"],
            "timestamp": file_info["timestamp"],
            "status": file_info.get("status", "success"),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting file info: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while getting file info: {str(e)}",
        )
