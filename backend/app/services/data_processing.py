# backend/app/services/data_processing.py
# This file provides services for reading, processing, and handling data from uploaded files.
# The following functionalities are implemented:
#
# 1. File Content Reading:
# - The `read_file_content` function reads the content of a given file (CSV or JSON).
# - It validates the existence of the file and raises an error if the file is not found.
# - For CSV files:
#   - The content is parsed into a pandas DataFrame.
#   - Each row is converted into a dictionary with the required structure:
#     - "timestamp" in HH:MM:SS format.
#     - "gps" as a dictionary with "latitude", "longitude", and "altitude".
#     - "radar" as a dictionary with "distance".
# - For JSON files:
#   - The content is loaded into a Python object.
#   - If the file contains a single object, it is converted into a list.
#   - Timestamps are validated and formatted as HH:MM:SS if necessary.
# - Errors during file reading or processing raise a `ValueError` with detailed information.
#
# 2. File Processing:
# - The `process_file` function processes an uploaded file using its ID and path.
# - It reads the file content using `read_file_content` and performs additional processing:
#   - Ensures that all timestamps are formatted as HH:MM:SS strings.
# - The processed data is saved to a new JSON file with the same base name as the original file, suffixed with `_processed`.
# - Any errors during processing are logged and raised for further handling.
#
# 3. Logging:
# - The module uses the `logging` library to log debug and error messages for troubleshooting.
#
# This module supports integration with a file upload and processing pipeline to validate, process, and store drone-related data.
import json
import csv
import pandas as pd
import logging
from pathlib import Path
from typing import List, Dict
from datetime import datetime
from io import StringIO

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def read_file_content(file_path: str | Path) -> List[Dict]:
    """Read and process file content."""
    logger.debug(f"Reading file: {file_path}")

    # Convert string path to Path object
    file_path = Path(file_path) if isinstance(file_path, str) else file_path

    if not file_path.exists():
        raise ValueError(f"File not found: {file_path}")

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        if file_path.suffix.lower() == ".csv":
            df = pd.read_csv(StringIO(content))

            # Convert to list of dicts
            data = []
            for _, row in df.iterrows():
                processed_row = {
                    "timestamp": row["timestamp"],  # Already in HH:MM:SS format
                    "gps": {
                        "latitude": float(row["latitude"]),
                        "longitude": float(row["longitude"]),
                        "altitude": float(row["altitude"]),
                    },
                    "radar": {"distance": float(row["radar_distance"])},
                }
                data.append(processed_row)

            return data

        else:  # JSON file
            data = json.loads(content)
            if isinstance(data, dict):
                data = [data]

            # Validate and ensure timestamp format
            for item in data:
                # Timestamp should already be in HH:MM:SS format
                if not isinstance(item["timestamp"], str):
                    item["timestamp"] = item["timestamp"].strftime("%H:%M:%S")

            return data

    except Exception as e:
        logger.error(f"Error processing file: {e}")
        raise ValueError(f"Error processing file: {str(e)}")


async def process_file(file_id: str, file_path: str | Path) -> None:
    """Process uploaded file."""
    logger.info(f"Processing file {file_id}")

    try:
        # Read and validate the file
        data = read_file_content(file_path)

        # Process the data
        for item in data:
            if not isinstance(item["timestamp"], str):
                item["timestamp"] = datetime.strptime(
                    str(item["timestamp"]), "%H:%M:%S"
                ).strftime("%H:%M:%S")

        # Save processed results
        file_path = Path(file_path)  # Convert to Path object
        results_path = file_path.with_name(f"{file_path.stem}_processed.json")
        with open(results_path, "w") as f:
            json.dump(data, f, indent=2)

        logger.info(f"Successfully processed file {file_id}")

    except Exception as e:
        logger.error(f"Error processing file {file_id}: {e}")
        raise
