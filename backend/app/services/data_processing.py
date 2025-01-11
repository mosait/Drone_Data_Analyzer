# backend/app/services/data_processing.py
import json
import csv
from pathlib import Path
import logging
from typing import List, Dict
from datetime import datetime
from ..core.config import settings

# Set up detailed logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def read_csv_file(file_path: Path) -> List[Dict]:
    """Read and parse CSV file."""
    logger.debug(f"Reading CSV file: {file_path}")
    data = []

    with open(file_path, "r", newline="") as f:
        # Print first few lines for debugging
        content = f.read()
        logger.debug(f"File content:\n{content[:500]}")
        f.seek(0)  # Reset file pointer

        reader = csv.DictReader(f)
        logger.debug(f"CSV headers: {reader.fieldnames}")

        for row in reader:
            try:
                processed_row = {
                    "timestamp": row["timestamp"].strip(),
                    "gps": {
                        "latitude": float(row["latitude"].strip()),
                        "longitude": float(row["longitude"].strip()),
                        "altitude": float(row["altitude"].strip()),
                    },
                    "radar": {"distance": float(row["radar_distance"].strip())},
                }
                data.append(processed_row)
            except Exception as e:
                logger.error(f"Error processing row: {row} - Error: {e}")
                continue

    logger.debug(f"Read {len(data)} records from CSV")
    return data


def read_file_content(file_path: Path) -> List[Dict]:
    """Read and process file content."""
    logger.debug(f"Reading file: {file_path}")

    if file_path.suffix.lower() == ".csv":
        return read_csv_file(file_path)

    # Try JSON if not CSV
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
            if isinstance(data, dict):
                return [data]
            return data
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON format")


def read_file_content(file_path: Path) -> List[Dict]:
    """Read and process file content."""
    logger.debug(f"Attempting to read file: {file_path}")

    # First, let's look at the file content
    try:
        with open(file_path, "rb") as f:
            raw_content = f.read(1024)  # Read first 1KB
            logger.debug(f"First 1KB of file content (hex): {raw_content.hex()[:100]}")
    except Exception as e:
        logger.error(f"Error reading raw content: {e}")

    try:
        # Try JSON first
        logger.debug("Attempting to read as JSON...")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                logger.debug(f"File content (first 100 chars): {content[:100]}")
                data = json.loads(content)
                if isinstance(data, dict):
                    data = [data]
                if not data:
                    logger.error("JSON data is empty")
                    raise ValueError("Empty JSON data")
                logger.debug(f"Successfully read {len(data)} records as JSON")
                return data
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            logger.debug(f"Failed to read as JSON: {e}")

            # Try CSV if JSON fails
            logger.debug("Attempting to read as CSV...")
            with open(file_path, "r", newline="", encoding="utf-8") as f:
                content = f.read()
                logger.debug(f"CSV content (first 100 chars): {content[:100]}")
                f.seek(0)
                reader = csv.DictReader(f)
                headers = reader.fieldnames
                logger.debug(f"CSV headers: {headers}")

                data = []
                for row_num, row in enumerate(reader, 1):
                    try:
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
                    except (KeyError, ValueError) as e:
                        logger.error(f"Error processing row {row_num}: {e}")
                        logger.error(f"Row content: {row}")

                if not data:
                    logger.error("No valid rows found in CSV")
                    raise ValueError("No valid rows in CSV")

                logger.debug(f"Successfully read {len(data)} records from CSV")
                return data

    except Exception as e:
        logger.error(f"Error reading file: {e}")
        raise ValueError(f"Error reading file: {str(e)}")


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

        # Read and validate the file exists
        path = Path(file_path)
        if not path.exists():
            raise ValueError(f"File not found: {file_path}")

        logger.debug(f"File size: {path.stat().st_size} bytes")

        # Read the data
        data = read_file_content(path)
        if not data:
            raise ValueError("No valid data found in file")

        logger.info(f"Successfully read {len(data)} records from file")

        # Calculate statistics
        altitude_values = [d["gps"]["altitude"] for d in data]
        distance_values = [d["radar"]["distance"] for d in data]
        timestamps = [
            datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00")) for d in data
        ]

        # Create processed data structure
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
            }
        }

        # Generate time series
        start_time = min(timestamps)
        time_series_points = []

        for i, d in enumerate(data):
            current_time = datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00"))
            duration = (current_time - start_time).total_seconds() / 60

            time_series_points.append(
                {
                    "duration": duration,
                    "altitude": d["gps"]["altitude"],
                    "distance": d["radar"]["distance"],
                    "avgAltitude": processed_data["summary"]["altitude"]["avg"],
                    "avgDistance": processed_data["summary"]["radar"]["avg"],
                }
            )

        processed_data["timeSeries"] = {
            "points": time_series_points,
            "averages": {
                "altitude": processed_data["summary"]["altitude"]["avg"],
                "distance": processed_data["summary"]["radar"]["avg"],
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
        logger.error(f"Error processing file {file_id}: {e}")
        # Update mapping with error status
        if "mapping" in locals() and file_id in mapping:
            mapping[file_id].update({"status": "error", "error": str(e)})
            with open(mapping_file, "w") as f:
                json.dump(mapping, f, indent=2)
        raise
