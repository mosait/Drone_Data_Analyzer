# backend/app/api/v1/endpoints/data.py
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pathlib import Path
from typing import Optional, List
import json
import csv
from datetime import datetime
import os
import logging
from ....core.config import settings

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()


def get_file_mapping():
    """Get the file ID mapping."""
    mapping_file = settings.UPLOAD_DIR / "file_mapping.json"
    try:
        if mapping_file.exists():
            with open(mapping_file, "r") as f:
                return json.load(f)
        return {}
    except Exception as e:
        logger.error(f"Error reading mapping file: {e}")
        return {}


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
                return data if isinstance(data, list) else [data]

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


@router.get("/{file_id}")
async def get_data(
    file_id: str,
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    include_summary: bool = Query(True),
):
    """Get drone data for a specific file."""
    logger.info(f"Getting data for file ID: {file_id}")

    try:
        file_path = get_file_path(file_id)
        data = read_file_content(file_path)
        logger.debug(f"Read {len(data)} records from file")

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

        if include_summary:
            summary = calculate_summary(data)
            return JSONResponse(content={"data": data, "summary": summary})

        return JSONResponse(content={"data": data})

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


def calculate_summary(data: List[dict]) -> dict:
    """Calculate summary statistics from the data."""
    logger.debug("Calculating summary statistics")

    if not data:
        return {
            "altitude": {"min": 0, "max": 0, "avg": 0, "count": 0},
            "radar": {"min": 0, "max": 0, "avg": 0, "count": 0},
        }

    try:
        altitude_values = [item["gps"]["altitude"] for item in data]
        radar_values = [item["radar"]["distance"] for item in data]

        summary = {
            "altitude": {
                "min": min(altitude_values),
                "max": max(altitude_values),
                "avg": sum(altitude_values) / len(altitude_values),
                "count": len(altitude_values),
            },
            "radar": {
                "min": min(radar_values),
                "max": max(radar_values),
                "avg": sum(radar_values) / len(radar_values),
                "count": len(radar_values),
            },
        }

        logger.debug("Summary calculated successfully")
        return summary

    except Exception as e:
        logger.error(f"Error calculating summary: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error calculating summary: {str(e)}"
        )


@router.get("/{file_id}/summary")
async def get_summary(file_id: str):
    """Get only the summary statistics for a specific file."""
    logger.info(f"Getting summary for file ID: {file_id}")

    try:
        file_path = get_file_path(file_id)
        data = read_file_content(file_path)
        summary = calculate_summary(data)
        return JSONResponse(content={"summary": summary})

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting summary: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
