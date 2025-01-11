# backend/app/utils/file_validator.py
import json
import csv
from pathlib import Path
import logging
from typing import Tuple, Optional
from io import StringIO

logger = logging.getLogger(__name__)


async def validate_file_content(
    file, max_size: int = 10 * 1024 * 1024
) -> Tuple[bool, Optional[str]]:
    """
    Validate file content before saving.
    Returns: (is_valid, error_message)
    """
    try:
        # Check file size
        content = await file.read(max_size + 1)
        if len(content) > max_size:
            return False, f"File size exceeds maximum allowed size of {max_size} bytes"

        # Try to decode content
        try:
            text_content = content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text_content = content.decode("utf-8-sig")
            except UnicodeDecodeError:
                try:
                    text_content = content.decode("iso-8859-1")
                except UnicodeDecodeError:
                    return False, "File encoding not supported"

        # Reset file position for later reading
        await file.seek(0)

        # Try parsing as JSON
        try:
            data = json.loads(text_content)
            if isinstance(data, list) and len(data) > 0:
                sample = data[0]
            elif isinstance(data, dict):
                sample = data
            else:
                return False, "JSON must contain an object or array of objects"

            # Validate structure
            required_fields = {"timestamp", "gps", "radar"}
            if not all(field in sample for field in required_fields):
                return (
                    False,
                    f"Missing required fields: {required_fields - set(sample.keys())}",
                )

            return True, None

        except json.JSONDecodeError:
            # Try parsing as CSV
            try:
                csv_file = StringIO(text_content)
                reader = csv.DictReader(csv_file)

                # Validate headers
                required_fields = {
                    "timestamp",
                    "latitude",
                    "longitude",
                    "altitude",
                    "radar_distance",
                }
                if not reader.fieldnames:
                    return False, "No CSV headers found"

                if not all(field in reader.fieldnames for field in required_fields):
                    return (
                        False,
                        f"Missing required CSV fields: {required_fields - set(reader.fieldnames)}",
                    )

                # Validate at least one row
                first_row = next(reader, None)
                if not first_row:
                    return False, "CSV file is empty"

                return True, None

            except Exception as e:
                return False, f"Invalid CSV format: {str(e)}"

    except Exception as e:
        logger.error(f"File validation error: {e}")
        return False, f"File validation failed: {str(e)}"

    finally:
        # Reset file position
        await file.seek(0)
