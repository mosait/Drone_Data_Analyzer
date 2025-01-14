# backend/app/services/data_processing.py

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


def read_file_content(file_path: Path) -> List[Dict]:
    """Read and process file content."""
    logger.debug(f"Reading file: {file_path}")

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


async def process_file(file_id: str, file_path: Path) -> None:
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
        results_path = file_path.with_name(f"{file_path.stem}_processed.json")
        with open(results_path, "w") as f:
            json.dump(data, f, indent=2)

        logger.info(f"Successfully processed file {file_id}")

    except Exception as e:
        logger.error(f"Error processing file {file_id}: {e}")
        raise
