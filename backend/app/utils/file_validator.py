# backend/app/utils/file_validator.py
# This file provides utilities to validate the contents of uploaded files (CSV and JSON).
# The following validations are performed:
#
# General Validations:
# - The file size does not exceed a specified maximum (`max_size`).
# - The file is not empty.
# - The file content is UTF-8 encoded.
#
# CSV File Validations:
# - The file has all required columns: "timestamp", "latitude", "longitude", "altitude", "radar_distance".
# - All timestamps in the "timestamp" column are in the HH:MM:SS format.
# - The "latitude", "longitude", "altitude", and "radar_distance" columns contain only numeric values.
#
# JSON File Validations:
# - The file contains a valid JSON structure, which must be either an array of objects or a single object (converted to an array).
# - Each object must contain the fields "timestamp", "gps", and "radar".
# - The "timestamp" field must be in HH:MM:SS format.
# - The "gps" field must contain the keys "latitude", "longitude", and "altitude".
# - The "radar" field must contain the key "distance".
#
# Unsupported file types or files that do not pass these validations are rejected with an appropriate error message.
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
) -> tuple[bool, str | None]:
    """
    Validate file content before saving.
    Returns: (is_valid, error_message)
    """
    try:
        # Read content
        content = await file.read()
        await file.seek(0)

        # Check file size
        if len(content) > max_size:
            return (
                False,
                f"File size exceeds maximum allowed size of {max_size/1024/1024:.1f}MB",
            )

        if len(content) == 0:
            return False, "File is empty"

        try:
            text_content = content.decode("utf-8")
        except UnicodeDecodeError:
            return False, "File must be UTF-8 encoded. Please check the file encoding."

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
                    return False, f"Missing required columns: {', '.join(missing)}"

                # Validate timestamp format
                invalid_timestamps = []
                for idx, ts in enumerate(df["timestamp"], 1):
                    try:
                        datetime.strptime(str(ts), "%H:%M:%S")
                    except ValueError:
                        invalid_timestamps.append(idx)

                if invalid_timestamps:
                    rows = ", ".join(map(str, invalid_timestamps[:3]))
                    suffix = " ..." if len(invalid_timestamps) > 3 else ""
                    return (
                        False,
                        f"Invalid timestamp format in rows: {rows}{suffix}. Expected format: HH:MM:SS",
                    )

                # Validate numeric columns
                numeric_columns = [
                    "latitude",
                    "longitude",
                    "altitude",
                    "radar_distance",
                ]
                for col in numeric_columns:
                    non_numeric = pd.to_numeric(df[col], errors="coerce").isna()
                    if non_numeric.any():
                        bad_rows = df.index[non_numeric].tolist()[:3]
                        rows = ", ".join(map(str, [i + 1 for i in bad_rows]))
                        suffix = " ..." if len(bad_rows) > 3 else ""
                        return (
                            False,
                            f"Non-numeric values in column '{col}' at rows: {rows}{suffix}",
                        )

                return True, None

            except pd.errors.EmptyDataError:
                return False, "CSV file is empty"
            except pd.errors.ParserError as e:
                return False, f"Invalid CSV format: {str(e)}"
            except Exception as e:
                return False, f"Error processing CSV file: {str(e)}"

        elif file_extension == ".json":
            try:
                data = json.loads(text_content)
                if isinstance(data, dict):
                    data = [data]

                if not isinstance(data, list):
                    return False, "JSON must contain an array of drone data records"

                # Validate each record
                for idx, item in enumerate(data, 1):
                    # Check required fields
                    if not all(
                        field in item for field in ["timestamp", "gps", "radar"]
                    ):
                        return (
                            False,
                            f"Missing required fields in record {idx}. Each record must have 'timestamp', 'gps', and 'radar' fields.",
                        )

                    # Validate timestamp format
                    try:
                        datetime.strptime(str(item["timestamp"]), "%H:%M:%S")
                    except ValueError:
                        return (
                            False,
                            f"Invalid timestamp format in record {idx}. Expected format: HH:MM:SS",
                        )

                    # Validate GPS data
                    gps = item.get("gps", {})
                    if not all(
                        field in gps for field in ["latitude", "longitude", "altitude"]
                    ):
                        return (
                            False,
                            f"Missing GPS fields in record {idx}. GPS data must include 'latitude', 'longitude', and 'altitude'.",
                        )

                    # Validate radar data
                    if "distance" not in item.get("radar", {}):
                        return (
                            False,
                            f"Missing radar distance in record {idx}. Radar data must include 'distance'.",
                        )

                    # Validate numeric values
                    try:
                        float(gps["latitude"])
                        float(gps["longitude"])
                        float(gps["altitude"])
                        float(item["radar"]["distance"])
                    except (ValueError, TypeError):
                        return (
                            False,
                            f"Invalid numeric values in record {idx}. GPS and radar values must be numbers.",
                        )

                return True, None

            except json.JSONDecodeError as e:
                line_info = f" near line {e.lineno}" if hasattr(e, "lineno") else ""
                return False, f"Invalid JSON format{line_info}: {str(e)}"

        else:
            return (
                False,
                f"Unsupported file type: {file_extension}. Only .csv and .json files are supported.",
            )

    except Exception as e:
        return False, f"File validation failed: {str(e)}"
    finally:
        await file.seek(0)
