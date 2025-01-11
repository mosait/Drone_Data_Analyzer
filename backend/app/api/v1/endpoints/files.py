# backend/app/api/v1/endpoints/files.py
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from typing import List
from datetime import datetime
import uuid
import os
import json
from pathlib import Path
from ....core.config import settings
from ....services.data_processing import process_file

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
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
) -> JSONResponse:
    """Upload a drone data file (CSV or JSON)."""
    try:
        # Generate timestamp and UUID
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_id = str(uuid.uuid4())

        # Create filename with timestamp
        original_filename = file.filename
        filename = f"{timestamp}_{original_filename}"
        file_path = settings.UPLOAD_DIR / filename

        # Save the file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Update file mapping
        mapping = get_file_mapping()
        mapping[file_id] = {
            "filename": original_filename,
            "timestamp": datetime.now().isoformat(),
            "path": str(file_path),
            "id": file_id,
            "status": "pending",
        }
        save_file_mapping(mapping)

        # Create response
        response_data = {
            "id": file_id,
            "filename": original_filename,
            "timestamp": mapping[file_id]["timestamp"],
            "status": "success",
        }

        # Start background processing
        background_tasks.add_task(process_file, file_id, str(file_path))

        return JSONResponse(status_code=200, content=response_data)

    except Exception as e:
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
            # Check if file still exists
            if Path(file_info["path"]).exists():
                files.append(
                    {
                        "id": file_id,
                        "filename": file_info[
                            "filename"
                        ],  # Changed from original_filename
                        "timestamp": file_info["timestamp"],
                        "status": file_info.get("status", "success"),
                    }
                )

        # Sort by timestamp descending
        files.sort(key=lambda x: x["timestamp"], reverse=True)
        return files

    except Exception as e:
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
        if not Path(file_info["path"]).exists():
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
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while getting file info: {str(e)}",
        )
