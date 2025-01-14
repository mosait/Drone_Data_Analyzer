# backend/app/utils/file_validator.py

import json
import csv
import pandas as pd
import logging
from io import StringIO
from pathlib import Path
from typing import Tuple, Optional
from datetime import datetime

# Set up logging
logger = logging.getLogger(__name__)


def validate_timestamp_format(timestamp: str) -> bool:
    """Validate if timestamp is in HH:MM:SS format"""
    try:
        datetime.strptime(timestamp, "%H:%M:%S")
        return True
    except ValueError:
        return False


async def validate_file_content(
    file, max_size: int = 10 * 1024 * 1024
) -> Tuple[bool, Optional[str]]:
    """
    Validate file content before saving.
    Returns: (is_valid, error_message)
    """
    logger.debug(f"Starting validation for file: {file.filename}")

    try:
        # Read content
        content = await file.read()
        await file.seek(0)

        if len(content) > max_size:
            return False, f"File size exceeds maximum allowed size of {max_size} bytes"

        if len(content) == 0:
            return False, "File is empty"

        try:
            text_content = content.decode("utf-8")
        except UnicodeDecodeError:
            return False, "File must be UTF-8 encoded"

        # Validate based on file type
        file_extension = Path(file.filename).suffix.lower()

        if file_extension == ".csv":
            try:
                df = pd.read_csv(StringIO(text_content))

                # Check required columns
                required_columns = {
                    "timestamp",
                    "latitude",
                    "longitude",
                    "altitude",
                    "radar_distance",
                }

                if not all(col in df.columns for col in required_columns):
                    missing = required_columns - set(df.columns)
                    return False, f"Missing required columns: {missing}"

                # Validate timestamp format
                if not all(
                    validate_timestamp_format(str(ts)) for ts in df["timestamp"]
                ):
                    return False, "Timestamps must be in HH:MM:SS format"

                # Validate numeric columns
                numeric_columns = [
                    "latitude",
                    "longitude",
                    "altitude",
                    "radar_distance",
                ]
                for col in numeric_columns:
                    if not pd.to_numeric(df[col], errors="coerce").notna().all():
                        return False, f"Column {col} must contain only numeric values"

                return True, None

            except Exception as e:
                logger.error(f"CSV validation error: {e}")
                return False, f"Invalid CSV format: {str(e)}"

        elif file_extension == ".json":
            try:
                data = json.loads(text_content)
                if isinstance(data, dict):
                    data = [data]

                if not isinstance(data, list):
                    return False, "JSON must contain an array of objects"

                # Validate each record
                for item in data:
                    # Check required fields
                    if not all(
                        field in item for field in ["timestamp", "gps", "radar"]
                    ):
                        return False, "Missing required fields in JSON"

                    # Validate timestamp format
                    if not validate_timestamp_format(item["timestamp"]):
                        return False, "Timestamps must be in HH:MM:SS format"

                    # Validate GPS data
                    gps = item.get("gps", {})
                    if not all(
                        field in gps for field in ["latitude", "longitude", "altitude"]
                    ):
                        return False, "Missing required GPS fields"

                    if "distance" not in item.get("radar", {}):
                        return False, "Missing radar distance"

                return True, None

            except json.JSONDecodeError as e:
                return False, f"Invalid JSON format: {str(e)}"

        else:
            return False, f"Unsupported file type: {file_extension}"

    except Exception as e:
        logger.error(f"Validation error: {e}")
        return False, f"File validation failed: {str(e)}"
    finally:
        await file.seek(0)
