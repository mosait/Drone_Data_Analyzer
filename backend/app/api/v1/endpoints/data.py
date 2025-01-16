# backend/app/api/v1/endpoints/data.py
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import JSONResponse
from pathlib import Path
from typing import Optional, List
import json
import csv
import io
from datetime import datetime, time
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


def time_to_minutes(t: time) -> float:
    """Convert time to minutes since midnight."""
    return t.hour * 60 + t.minute + t.second / 60


def parse_time(time_str: str) -> time:
    """Parse time string in HH:MM:SS format."""
    try:
        return datetime.strptime(time_str, "%H:%M:%S").time()
    except ValueError as e:
        logger.error(f"Error parsing time: {e}")
        raise ValueError(f"Invalid time format: {time_str}")


def calculate_duration(start_time_str: str, end_time_str: str) -> float:
    """Calculate duration between two time strings in minutes."""
    start_time = parse_time(start_time_str)
    end_time = parse_time(end_time_str)

    start_minutes = time_to_minutes(start_time)
    end_minutes = time_to_minutes(end_time)

    return end_minutes - start_minutes


def read_file_content(file_path: Path) -> List[dict]:
    """Read and parse file content based on extension."""
    logger.debug(f"Reading file: {file_path}")

    try:
        if file_path.suffix.lower() == ".json":
            logger.debug("Processing JSON file")
            with open(file_path, "r") as f:
                data = json.load(f)
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


def calculate_metrics(data: List[dict]):
    """Calculate all metrics for the dataset."""
    if not data:
        raise ValueError("No data provided")

    # Basic metrics
    altitude_values = [d["gps"]["altitude"] for d in data]
    distance_values = [d["radar"]["distance"] for d in data]

    # Calculate duration
    total_duration = calculate_duration(data[0]["timestamp"], data[-1]["timestamp"])

    # Calculate time series with proper duration
    time_series = []
    start_time = parse_time(data[0]["timestamp"])
    max_altitude = max(altitude_values)
    min_altitude = min(altitude_values)
    avg_altitude = sum(altitude_values) / len(altitude_values)
    max_distance = max(distance_values)
    min_distance = min(distance_values)
    avg_distance = sum(distance_values) / len(distance_values)

    for item in data:
        current_time = parse_time(item["timestamp"])
        duration = time_to_minutes(current_time) - time_to_minutes(start_time)

        point = {
            "duration": round(duration, 2),
            "altitude": item["gps"]["altitude"],
            "distance": item["radar"]["distance"],
            "normalizedAltitude": (
                (item["gps"]["altitude"] - min_altitude) / (max_altitude - min_altitude)
                if max_altitude != min_altitude
                else 0
            ),
            "normalizedDistance": (
                (item["radar"]["distance"] - min_distance)
                / (max_distance - min_distance)
                if max_distance != min_distance
                else 0
            ),
            "time": item["timestamp"],
        }
        time_series.append(point)

    return {
        "flightMetrics": {
            "duration": round(total_duration, 2),
            "maxAltitude": max_altitude,
            "minAltitude": min_altitude,
            "avgAltitude": round(avg_altitude, 2),
            "maxDistance": max_distance,
            "minDistance": min_distance,
            "avgDistance": round(avg_distance, 2),
            "totalPoints": len(data),
            "startTime": data[0]["timestamp"],
            "endTime": data[-1]["timestamp"],
        },
        "timeSeries": time_series,
        "summary": {
            "altitude": {
                "max": max_altitude,
                "min": min_altitude,
                "avg": round(avg_altitude, 2),
                "change": round(altitude_values[-1] - altitude_values[0], 2),
            },
            "radar": {
                "max": max_distance,
                "min": min_distance,
                "avg": round(avg_distance, 2),
                "change": round(distance_values[-1] - distance_values[0], 2),
            },
        },
    }


@router.get("/{file_id}")
async def get_data(
    file_id: str,
    start_time: Optional[time] = Query(None),
    end_time: Optional[time] = Query(None),
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

        if not data:
            raise HTTPException(status_code=404, detail="No data found in file")

        # Calculate all metrics
        metrics = calculate_metrics(data)

        response_data = {"data": data, "metrics": metrics}

        return JSONResponse(content=response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# backend/app/api/v1/endpoints/data.py
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import JSONResponse, PlainTextResponse
from pathlib import Path
from typing import Optional, List
import json
import csv
from io import StringIO
from datetime import datetime, time
import logging
from ....core.config import settings


@router.get("/{file_id}/export")
async def export_data(
    response: Response, file_id: str, format: str = Query(..., regex="^(csv|json)$")
):
    """Export drone data in specified format."""
    logger.info(f"Exporting file {file_id} in {format} format")

    try:
        # Get file path and read data
        file_path = get_file_path(file_id)
        data = read_file_content(file_path)

        if not data:
            raise HTTPException(status_code=404, detail="No data found in file")

        if format == "csv":
            # Use StringIO with proper newline handling
            output = StringIO(newline="")
            writer = csv.writer(output, lineterminator="\n")

            # Write header
            writer.writerow(
                ["timestamp", "latitude", "longitude", "altitude", "radar_distance"]
            )

            # Write data rows with proper formatting
            for item in data:
                writer.writerow(
                    [
                        item["timestamp"],
                        f"{item['gps']['latitude']:.4f}",
                        f"{item['gps']['longitude']:.4f}",
                        str(int(round(item["gps"]["altitude"]))),
                        str(int(round(item["radar"]["distance"]))),
                    ]
                )

            # Get content and close StringIO
            content = output.getvalue()
            output.close()

            # Return plain text response with proper headers
            response = PlainTextResponse(content=content, media_type="text/csv")
            response.headers["Content-Disposition"] = (
                "attachment; filename=drone_data.csv"
            )
            return response

        else:  # JSON format
            # Format data properly
            formatted_data = []
            for item in data:
                formatted_item = {
                    "timestamp": item["timestamp"],
                    "gps": {
                        "latitude": round(float(item["gps"]["latitude"]), 4),
                        "longitude": round(float(item["gps"]["longitude"]), 4),
                        "altitude": int(round(item["gps"]["altitude"])),
                    },
                    "radar": {"distance": int(round(item["radar"]["distance"]))},
                }
                formatted_data.append(formatted_item)

            # Create formatted JSON string with proper indentation
            json_str = json.dumps(formatted_data, indent=2)

            # Return as PlainTextResponse to preserve formatting
            response = PlainTextResponse(
                content=json_str, media_type="application/json"
            )
            response.headers["Content-Disposition"] = (
                "attachment; filename=drone_data.json"
            )
            return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Export error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
