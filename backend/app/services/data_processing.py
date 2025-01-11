# backend/app/services/data_processing.py

import json
import csv
import pandas as pd
import logging
from pathlib import Path
from typing import List, Dict
from datetime import datetime
from io import StringIO
from ..core.config import settings

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def read_file_content(file_path: Path) -> List[Dict]:
    """Read and process file content."""
    logger.debug(f"Reading file: {file_path}")

    if not file_path.exists():
        logger.error(f"File not found: {file_path}")
        raise ValueError(f"File not found: {file_path}")

    file_size = file_path.stat().st_size
    logger.debug(f"File size: {file_size} bytes")

    if file_size == 0:
        logger.error("File is empty")
        raise ValueError("File is empty")

    try:
        # Try reading with different encodings
        for encoding in ["utf-8", "utf-8-sig", "iso-8859-1"]:
            try:
                with open(file_path, "r", encoding=encoding) as f:
                    content = f.read()
                logger.debug(f"Successfully read file with {encoding} encoding")
                break
            except UnicodeDecodeError:
                continue
        else:
            raise ValueError("Could not read file with any supported encoding")

        # Process based on file type
        if file_path.suffix.lower() == ".csv":
            logger.debug("Processing CSV file")
            try:
                df = pd.read_csv(StringIO(content))

                # Validate CSV structure
                required_columns = {
                    "timestamp",
                    "latitude",
                    "longitude",
                    "altitude",
                    "radar_distance",
                }
                if not all(col in df.columns for col in required_columns):
                    raise ValueError(
                        f"Missing required columns: {required_columns - set(df.columns)}"
                    )

                data = []
                for _, row in df.iterrows():
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

                logger.debug(f"Successfully processed {len(data)} records from CSV")
                return data

            except Exception as e:
                logger.error(f"Failed to parse CSV: {e}")
                raise ValueError(f"Failed to parse CSV: {str(e)}")

        else:  # JSON file
            logger.debug("Processing JSON file")
            try:
                data = json.loads(content)
                if isinstance(data, dict):
                    data = [data]
                elif not isinstance(data, list):
                    raise ValueError("JSON must contain an object or array of objects")

                # Validate JSON structure
                for item in data:
                    if not all(
                        field in item for field in ["timestamp", "gps", "radar"]
                    ):
                        raise ValueError("Missing required fields in JSON")

                    gps = item.get("gps", {})
                    if not all(
                        field in gps for field in ["latitude", "longitude", "altitude"]
                    ):
                        raise ValueError("Missing required GPS fields in JSON")

                    if "distance" not in item.get("radar", {}):
                        raise ValueError("Missing radar distance in JSON")

                logger.debug(f"Successfully processed {len(data)} records from JSON")
                return data

            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON: {e}")
                raise ValueError(f"Failed to parse JSON: {str(e)}")

    except Exception as e:
        logger.error(f"Error processing file: {e}", exc_info=True)
        raise ValueError(f"Error processing file: {str(e)}")


async def process_file(file_id: str, file_path: str) -> None:
    """Process uploaded file in background."""
    logger.info(f"Processing file {file_id} at {file_path}")

    try:
        # Get the file mapping
        mapping_file = settings.UPLOAD_DIR / "file_mapping.json"
        with open(mapping_file, "r") as f:
            mapping = json.load(f)

        # Update status to processing
        if file_id in mapping:
            mapping[file_id]["status"] = "processing"
            with open(mapping_file, "w") as f:
                json.dump(mapping, f, indent=2)

        # Read and validate the file
        path = Path(file_path)
        logger.debug(f"Reading file content from {path}")

        data = read_file_content(path)
        if not data:
            raise ValueError("No valid data found in file")

        logger.debug(f"Successfully read {len(data)} records")

        # Process and calculate statistics
        timestamps = [
            datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00")) for d in data
        ]
        altitude_values = [d["gps"]["altitude"] for d in data]
        distance_values = [d["radar"]["distance"] for d in data]

        # Calculate time series data
        start_time = min(timestamps)
        time_series_points = []

        for i, d in enumerate(data):
            current_time = datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00"))
            duration = (current_time - start_time).total_seconds() / 60

            point = {
                "duration": duration,
                "altitude": d["gps"]["altitude"],
                "distance": d["radar"]["distance"],
                "avgAltitude": sum(altitude_values) / len(altitude_values),
                "avgDistance": sum(distance_values) / len(distance_values),
            }
            time_series_points.append(point)

        # Create processed results
        processed_data = {
            "summary": {
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
            },
            "timeSeries": {
                "points": time_series_points,
                "averages": {
                    "altitude": sum(altitude_values) / len(altitude_values),
                    "distance": sum(distance_values) / len(distance_values),
                },
            },
        }

        # Save processed results
        results_path = path.with_name(path.stem + "_results.json")
        with open(results_path, "w") as f:
            json.dump(processed_data, f, indent=2)

        # Update mapping with success status
        if file_id in mapping:
            mapping[file_id].update(
                {
                    "status": "success",
                    "processed": True,
                    "results_path": str(results_path),
                }
            )
            with open(mapping_file, "w") as f:
                json.dump(mapping, f, indent=2)

        logger.info(f"Successfully processed file {file_id}")

    except Exception as e:
        logger.error(f"Error processing file {file_id}: {e}", exc_info=True)
        # Update mapping with error status
        if "mapping" in locals() and file_id in mapping:
            mapping[file_id].update({"status": "error", "error": str(e)})
            with open(mapping_file, "w") as f:
                json.dump(mapping, f, indent=2)
        raise
