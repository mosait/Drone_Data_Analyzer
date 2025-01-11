# backend/app/utils/file_validator.py

import json
import csv
import pandas as pd
import logging
from io import StringIO
from pathlib import Path
from typing import Tuple, Optional

# Set up logging
logger = logging.getLogger(__name__)


async def validate_file_content(
    file, max_size: int = 10 * 1024 * 1024
) -> Tuple[bool, Optional[str]]:
    """
    Validate file content before saving.
    Returns: (is_valid, error_message)
    """
    logger.debug(f"Starting validation for file: {file.filename}")

    try:
        # Read content in chunks to handle large files
        content = bytearray()
        total_size = 0
        chunk_size = 8192  # 8KB chunks

        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            content.extend(chunk)
            total_size += len(chunk)
            if total_size > max_size:
                logger.warning(f"File exceeds size limit: {total_size} > {max_size}")
                return (
                    False,
                    f"File size exceeds maximum allowed size of {max_size} bytes",
                )

        logger.debug(f"Total file size: {total_size} bytes")

        if total_size == 0:
            logger.warning("File is empty")
            return False, "File is empty"

        # Reset file position
        await file.seek(0)

        try:
            text_content = content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text_content = content.decode("utf-8-sig")
            except UnicodeDecodeError:
                try:
                    text_content = content.decode("iso-8859-1")
                except UnicodeDecodeError:
                    logger.error("Failed to decode file with any supported encoding")
                    return False, "Unsupported file encoding"

        # Log content preview for debugging
        logger.debug(f"Content preview: {text_content[:200]}")

        # Validate based on file type
        file_extension = Path(file.filename).suffix.lower()

        if file_extension == ".csv":
            logger.debug("Validating CSV format")
            try:
                # Use pandas to validate CSV structure
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
                    logger.warning(f"Missing required columns: {missing}")
                    return False, f"Missing required columns: {missing}"

                # Validate data types
                try:
                    df["timestamp"] = pd.to_datetime(df["timestamp"])
                    df[["latitude", "longitude", "altitude", "radar_distance"]] = df[
                        ["latitude", "longitude", "altitude", "radar_distance"]
                    ].astype(float)
                except Exception as e:
                    logger.error(f"Data type validation failed: {e}")
                    return False, "Invalid data types in CSV"

                return True, None

            except Exception as e:
                logger.error(f"CSV validation error: {e}")
                return False, f"Invalid CSV format: {str(e)}"

        elif file_extension == ".json":
            logger.debug("Validating JSON format")
            try:
                data = json.loads(text_content)

                # Validate JSON structure
                if isinstance(data, dict):
                    data = [data]
                elif not isinstance(data, list):
                    return False, "JSON must contain an object or array of objects"

                # Validate required fields
                for item in data:
                    if not all(
                        field in item for field in ["timestamp", "gps", "radar"]
                    ):
                        return False, "Missing required fields in JSON"

                    gps = item.get("gps", {})
                    if not all(
                        field in gps for field in ["latitude", "longitude", "altitude"]
                    ):
                        return False, "Missing required GPS fields in JSON"

                    if "distance" not in item.get("radar", {}):
                        return False, "Missing radar distance in JSON"

                return True, None

            except json.JSONDecodeError as e:
                logger.error(f"JSON validation error: {e}")
                return False, f"Invalid JSON format: {str(e)}"
        else:
            logger.warning(f"Unsupported file type: {file_extension}")
            return False, f"Unsupported file type: {file_extension}"

    except Exception as e:
        logger.error(f"Unexpected error during validation: {e}", exc_info=True)
        return False, f"File validation failed: {str(e)}"
    finally:
        # Always reset file position
        await file.seek(0)
