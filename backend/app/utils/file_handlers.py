# backend/app/utils/file_handlers.py
import pandas as pd
import json
from pathlib import Path
from fastapi import UploadFile, HTTPException
from ..models.drone_data import DroneData, DroneDataList
from ..core.config import settings


async def save_upload_file(file: UploadFile) -> Path:
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

    # Save file
    file_path = (
        settings.UPLOAD_DIR
        / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    )
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    return file_path


def parse_file(file_path: Path) -> DroneDataList:
    if file_path.suffix.lower() == ".csv":
        return parse_csv(file_path)
    elif file_path.suffix.lower() == ".json":
        return parse_json(file_path)
    else:
        raise HTTPException(status_code=415, detail="Unsupported file type")


def parse_csv(file_path: Path) -> DroneDataList:
    try:
        df = pd.read_csv(file_path)
        data = []
        for _, row in df.iterrows():
            data.append(
                DroneData(
                    timestamp=pd.to_datetime(row["timestamp"]),
                    altitude=row["altitude"],
                    gps=GPSData(
                        latitude=row["gps_latitude"], longitude=row["gps_longitude"]
                    ),
                    radar=RadarData(
                        distance=row["radar_distance"], velocity=row["radar_velocity"]
                    ),
                )
            )
        return DroneDataList(data=data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV file: {str(e)}")


def parse_json(file_path: Path) -> DroneDataList:
    try:
        with open(file_path) as f:
            data = json.load(f)
            return DroneDataList.model_validate({"data": data})
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error parsing JSON file: {str(e)}"
        )
