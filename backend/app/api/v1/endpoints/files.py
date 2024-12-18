# backend/app/api/v1/endpoints/files.py
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from typing import List
from datetime import datetime
import uuid
import os
from ....core.config import settings
from ....services.data_processing import process_file
from ....models.drone_data import AnalysisResult

router = APIRouter()


@router.post("/upload")
async def upload_file(
    background_tasks: BackgroundTasks,  # Move this before the optional parameter
    file: UploadFile = File(...),
):
    try:
        # Validate file extension
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in [".csv", ".json"]:
            raise HTTPException(
                status_code=400, detail="Only CSV and JSON files are allowed"
            )

        # Generate unique file ID
        file_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file_id}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Store metadata
        file_info = {
            "id": file_id,
            "filename": file.filename,
            "path": file_path,
            "timestamp": datetime.now().isoformat(),
            "status": "uploaded",
        }

        # Start processing in background
        background_tasks.add_task(process_file, file_id, file_path)

        return JSONResponse(content=file_info)

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while uploading the file: {str(e)}",
        )


@router.get("/")
async def list_files() -> List[dict]:
    """List all uploaded files"""
    try:
        files = []
        for filename in os.listdir(settings.UPLOAD_DIR):
            if filename.endswith((".csv", ".json")):
                file_path = os.path.join(settings.UPLOAD_DIR, filename)
                file_stat = os.stat(file_path)
                files.append(
                    {
                        "id": filename.split("_")[1].split(".")[0],
                        "filename": filename,
                        "timestamp": datetime.fromtimestamp(
                            file_stat.st_mtime
                        ).isoformat(),
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
    """Get information about a specific file"""
    try:
        # Search for file in upload directory
        for filename in os.listdir(settings.UPLOAD_DIR):
            if file_id in filename:
                file_path = os.path.join(settings.UPLOAD_DIR, filename)
                file_stat = os.stat(file_path)
                return {
                    "id": file_id,
                    "filename": filename,
                    "timestamp": datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
                    "size": file_stat.st_size,
                }

        raise HTTPException(status_code=404, detail="File not found")

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while getting file info: {str(e)}",
        )
