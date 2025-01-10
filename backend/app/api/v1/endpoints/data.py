# backend/app/api/v1/endpoints/data.py
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pathlib import Path
from typing import Optional, List
import json
import csv
from datetime import datetime
import logging
from ....core.config import settings

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()


def read_file_content(file_path: Path) -> List[dict]:
    """Read and parse file content based on extension."""
    logger.debug(f"Reading file: {file_path}")

    try:
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        if file_path.suffix.lower() == ".json":
            logger.debug("Processing JSON file")
            with open(file_path, "r") as f:
                data = json.load(f)
                # Ensure we return a list
                if isinstance(data, dict):
                    data = [data]
                logger.debug(f"Read {len(data)} records from JSON")
                return data

        elif file_path.suffix.lower() == ".csv":
            logger.debug("Processing CSV file")
            data = []
            with open(file_path, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    processed_row = {
                        "timestamp": row["timestamp"],
                        "gps": {
                            "latitude": float(row["latitude"]),
                            "longitude": float(row["longitude"]),
                            "altitude": float(row["altitude"]),
                        },
                        "radar": {"distance": float(row["radar_distance"])},
                    }
                    data.append(processed_row)
            logger.debug(f"Read {len(data)} records from CSV")
            return data

        else:
            raise HTTPException(
                status_code=400, detail=f"Unsupported file format: {file_path.suffix}"
            )

    except (json.JSONDecodeError, csv.Error) as e:
        logger.error(f"File parsing error: {e}")
        raise HTTPException(status_code=400, detail=f"File parsing error: {str(e)}")
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")


def get_file_path(file_id: str) -> Path:
    """Get file path from mapping."""
    logger.debug(f"Getting file path for ID: {file_id}")

    # Get the mapping file
    mapping_file = settings.UPLOAD_DIR / "file_mapping.json"
    if mapping_file.exists():
        with open(mapping_file, "r") as f:
            mapping = json.load(f)
            if file_id in mapping:
                file_path = Path(mapping[file_id]["path"])
                if file_path.exists():
                    logger.debug(f"Found file at: {file_path}")
                    return file_path

    # Fallback to searching by ID prefix
    for file_path in settings.UPLOAD_DIR.glob(f"*{file_id}*"):
        if file_path.is_file():
            logger.debug(f"Found file at: {file_path}")
            return file_path

    logger.error(f"No file found for ID: {file_id}")
    raise HTTPException(status_code=404, detail="File not found")


def calculate_time_series(data: List[dict]) -> dict:
    """Calculate time series points."""
    try:
        points = []
        timestamps = [
            datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00")) for d in data
        ]
        start_time = min(timestamps)

        # Calculate averages
        altitude_values = [d["gps"]["altitude"] for d in data]
        distance_values = [d["radar"]["distance"] for d in data]
        avg_altitude = sum(altitude_values) / len(altitude_values)
        avg_distance = sum(distance_values) / len(distance_values)

        for i, d in enumerate(data):
            time = datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00"))
            duration = (time - start_time).total_seconds() / 60  # Convert to minutes

            points.append(
                {
                    "duration": duration,
                    "altitude": d["gps"]["altitude"],
                    "distance": d["radar"]["distance"],
                    "avgAltitude": avg_altitude,
                    "avgDistance": avg_distance,
                }
            )

        return {
            "points": points,
            "averages": {"altitude": avg_altitude, "distance": avg_distance},
        }
    except Exception as e:
        logger.error(f"Error calculating time series: {e}")
        raise


@router.get("/{file_id}")
async def get_data(
    file_id: str,
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    include_summary: bool = Query(True),
):
    """Get processed drone data for a specific file."""
    logger.info(f"Getting data for file ID: {file_id}")

    try:
        # Get and read the file
        file_path = get_file_path(file_id)
        data = read_file_content(file_path)
        logger.debug(f"Read {len(data)} records")

        if not data:
            raise HTTPException(status_code=404, detail="No data found in file")

        # Apply time filters if provided
        if start_time or end_time:
            filtered_data = []
            for item in data:
                item_time = datetime.fromisoformat(
                    item["timestamp"].replace("Z", "+00:00")
                )
                if start_time and item_time < start_time:
                    continue
                if end_time and item_time > end_time:
                    continue
                filtered_data.append(item)
            data = filtered_data

        if not data:
            raise HTTPException(
                status_code=404, detail="No data found for specified time range"
            )

        response_data = {
            "data": data,
        }

        # Calculate summary if requested
        if include_summary:
            altitude_values = [d["gps"]["altitude"] for d in data]
            distance_values = [d["radar"]["distance"] for d in data]

            response_data["summary"] = {
                "altitude": {
                    "max": max(altitude_values),
                    "min": min(altitude_values),
                    "avg": sum(altitude_values) / len(altitude_values),
                    "change": f"{altitude_values[-1] - altitude_values[0]:+.1f}",
                },
                "radar": {
                    "max": max(distance_values),
                    "min": min(distance_values),
                    "avg": sum(distance_values) / len(distance_values),
                    "change": f"{distance_values[-1] - distance_values[0]:+.1f}",
                },
            }

            # Calculate time series
            response_data["timeSeries"] = calculate_time_series(data)

        logger.debug("Returning response data")
        return JSONResponse(content=response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
