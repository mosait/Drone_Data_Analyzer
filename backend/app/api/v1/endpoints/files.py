# backend/app/api/v1/endpoints/files.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List
from datetime import datetime
import uuid
import shutil
import os
from ....core.config import settings

router = APIRouter()

# In-memory storage for file metadata (in production, use a database)
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

uploaded_files = {}


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Validate file extension
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in [".csv", ".json"]:
            raise HTTPException(
                status_code=400, detail="Only CSV and JSON files are allowed"
            )

        # Generate unique file ID and path
        file_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Store metadata
        file_info = {
            "id": file_id,
            "filename": file.filename,
            "path": file_path,
            "timestamp": datetime.now().isoformat(),
            "status": "success",
        }
        uploaded_files[file_id] = file_info

        return JSONResponse(content=file_info)

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def list_files() -> List[dict]:
    """List all uploaded files"""
    return list(uploaded_files.values())


@router.get("/{file_id}")
async def get_file_info(file_id: str):
    """Get information about a specific file"""
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    return uploaded_files[file_id]
