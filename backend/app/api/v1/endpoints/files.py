# backend/app/api/v1/endpoints/files.py
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from typing import List
from datetime import datetime
import uuid
import os
from ....core.config import settings
from ....utils.file_handlers import save_upload_file
from ....services.data_processing import process_file

router = APIRouter()


@router.post("/upload")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
) -> JSONResponse:
    """Upload a drone data file (CSV or JSON)."""
    try:
        # Save the file and get the path
        file_path = await save_upload_file(file)

        # Generate a unique ID for the file
        file_id = str(uuid.uuid4())

        # Create response data
        file_info = {
            "id": file_id,
            "filename": file.filename,
            "path": str(file_path),
            "timestamp": datetime.now().isoformat(),
            "status": "uploaded",
        }

        # Start background processing
        background_tasks.add_task(process_file, file_id, file_path)

        return JSONResponse(status_code=200, content=file_info)

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while uploading the file: {str(e)}",
        )


@router.get("/")
async def list_files() -> List[dict]:
    """List all uploaded files."""
    try:
        files = []
        for filename in os.listdir(settings.UPLOAD_DIR):
            if filename.endswith(tuple(settings.ALLOWED_EXTENSIONS)):
                file_path = os.path.join(settings.UPLOAD_DIR, filename)
                file_stat = os.stat(file_path)

                # Extract the original filename without timestamp
                original_filename = "_".join(filename.split("_")[1:])

                files.append(
                    {
                        "id": filename.split("_")[0],  # Use timestamp as ID
                        "filename": original_filename,
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
    """Get information about a specific file."""
    try:
        # Search for file in upload directory
        for filename in os.listdir(settings.UPLOAD_DIR):
            if file_id in filename:
                file_path = os.path.join(settings.UPLOAD_DIR, filename)
                file_stat = os.stat(file_path)
                return {
                    "id": file_id,
                    "filename": "_".join(
                        filename.split("_")[1:]
                    ),  # Remove timestamp prefix
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
