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

logger = logging.getLogger(__name__)

router = APIRouter()


def get_file_mapping():
    """Get or create the file ID mapping."""
    mapping_file = settings.UPLOAD_DIR / "file_mapping.json"
    try:
        if mapping_file.exists():
            with open(mapping_file, "r") as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error reading mapping file: {e}")
    return {}


def get_file_path(file_id: str) -> Path:
    """Get file path from mapping."""
    logger.debug(f"Getting file path for ID: {file_id}")
    mapping = get_file_mapping()

    if file_id not in mapping:
        logger.error(f"File ID not found in mapping: {file_id}")
        raise HTTPException(status_code=404, detail="File not found")

    file_path = Path(mapping[file_id]["path"])
    if not file_path.exists():
        logger.error(f"File not found at path: {file_path}")
        raise HTTPException(status_code=404, detail="File not found")

    logger.debug(f"Found file at: {file_path}")
    return file_path


def read_file_content(file_path: Path) -> List[dict]:
    """Read and parse file content based on extension."""
    logger.debug(f"Reading file: {file_path}")

    try:
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
            logger.error(f"Unsupported file format: {file_path.suffix}")
            raise HTTPException(
                status_code=400, detail=f"Unsupported file format: {file_path.suffix}"
            )

    except Exception as e:
        logger.error(f"Error reading file: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
        # Get file path from mapping
        file_path = get_file_path(file_id)

        # Read and parse the file
        data = read_file_content(file_path)
        logger.debug(f"Read {len(data)} records")

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
            logger.debug(f"Filtered to {len(data)} records")

        if not data:
            raise HTTPException(status_code=404, detail="No data found in file")

        response_data = {"data": data}

        # Add summary if requested
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

            # Add time series data
            timestamps = [
                datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00"))
                for d in data
            ]
            start_time = min(timestamps)

            time_series_points = []
            for i, d in enumerate(data):
                current_time = datetime.fromisoformat(
                    d["timestamp"].replace("Z", "+00:00")
                )
                duration = (current_time - start_time).total_seconds() / 60

                time_series_points.append(
                    {
                        "duration": duration,
                        "altitude": d["gps"]["altitude"],
                        "distance": d["radar"]["distance"],
                        "avgAltitude": response_data["summary"]["altitude"]["avg"],
                        "avgDistance": response_data["summary"]["radar"]["avg"],
                    }
                )

            response_data["timeSeries"] = {
                "points": time_series_points,
                "averages": {
                    "altitude": response_data["summary"]["altitude"]["avg"],
                    "distance": response_data["summary"]["radar"]["avg"],
                },
            }

        return JSONResponse(content=response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
