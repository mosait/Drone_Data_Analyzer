# backend/app/utils/file_handlers.py
import pandas as pd
import json
from pathlib import Path
from fastapi import UploadFile, HTTPException
from datetime import datetime
from ..models.drone_data import DroneData, DroneDataList, GPSData, RadarData
from ..core.config import settings


async def save_upload_file(file: UploadFile) -> Path:
    """Save uploaded file and return the path."""
    # Validate file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large")
    file.file.seek(0)

    # Validate extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail="Unsupported file type")

    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = Path(settings.UPLOAD_DIR) / safe_filename

    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    return file_path


def parse_file(file_path: Path) -> DroneDataList:
    """Parse file and return drone data list."""
    if file_path.suffix.lower() == ".csv":
        return parse_csv(file_path)
    elif file_path.suffix.lower() == ".json":
        return parse_json(file_path)
    else:
        raise HTTPException(status_code=415, detail="Unsupported file type")


def parse_csv(file_path: Path) -> DroneDataList:
    """Parse CSV file into DroneDataList."""
    try:
        df = pd.read_csv(file_path)
        data = []
        for _, row in df.iterrows():
            data.append(
                DroneData(
                    timestamp=pd.to_datetime(row["timestamp"]),
                    gps=GPSData(
                        latitude=float(row["latitude"]),
                        longitude=float(row["longitude"]),
                        altitude=float(row["altitude"]),
                    ),
                    radar=RadarData(distance=float(row["radar_distance"])),
                )
            )
        return DroneDataList(data=data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV file: {str(e)}")


def parse_json(file_path: Path) -> DroneDataList:
    """Parse JSON file into DroneDataList."""
    try:
        with open(file_path) as f:
            raw_data = json.load(f)
            data = []
            for item in raw_data:
                data.append(
                    DroneData(
                        timestamp=item["timestamp"],
                        gps=GPSData(
                            latitude=float(item["gps"]["latitude"]),
                            longitude=float(item["gps"]["longitude"]),
                            altitude=float(item["gps"]["altitude"]),
                        ),
                        radar=RadarData(distance=float(item["radar"]["distance"])),
                    )
                )
            return DroneDataList(data=data)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error parsing JSON file: {str(e)}"
        )
