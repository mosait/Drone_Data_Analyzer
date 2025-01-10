# backend/app/services/data_processing.py
from pathlib import Path
import json
import logging
import numpy as np
from datetime import datetime
from typing import List, Dict
from ..core.config import settings

logger = logging.getLogger(__name__)


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two GPS coordinates using Haversine formula."""
    R = 6371e3  # Earth's radius in meters
    φ1 = np.radians(lat1)
    φ2 = np.radians(lat2)
    Δφ = np.radians(lat2 - lat1)
    Δλ = np.radians(lon2 - lon1)

    a = np.sin(Δφ / 2) * np.sin(Δφ / 2) + np.cos(φ1) * np.cos(φ2) * np.sin(
        Δλ / 2
    ) * np.sin(Δλ / 2)
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))

    return R * c


def process_data(data: List[dict]) -> Dict:
    """Process drone data and generate analysis results."""
    try:
        # Calculate time-based metrics
        timestamps = [
            datetime.fromisoformat(d["timestamp"].replace("Z", "+00:00")) for d in data
        ]
        flight_duration = (max(timestamps) - min(timestamps)).total_seconds()

        # Calculate total distance traveled
        total_distance = 0
        for i in range(1, len(data)):
            total_distance += calculate_distance(
                data[i - 1]["gps"]["latitude"],
                data[i - 1]["gps"]["longitude"],
                data[i]["gps"]["latitude"],
                data[i]["gps"]["longitude"],
            )

        # Calculate altitude and radar metrics
        altitudes = [d["gps"]["altitude"] for d in data]
        radar_distances = [d["radar"]["distance"] for d in data]

        # Calculate statistics
        stats = {
            "altitude": {
                "max": max(altitudes),
                "min": min(altitudes),
                "avg": sum(altitudes) / len(altitudes),
                "change": f"{altitudes[-1] - altitudes[0]:+.1f}",
            },
            "radar": {
                "max": max(radar_distances),
                "min": min(radar_distances),
                "avg": sum(radar_distances) / len(radar_distances),
                "change": f"{radar_distances[-1] - radar_distances[0]:+.1f}",
            },
        }

        # Generate time series data
        base_time = min(timestamps)
        time_series = []
        for i, d in enumerate(data):
            duration = (
                timestamps[i] - base_time
            ).total_seconds() / 60  # Convert to minutes
            time_series.append(
                {
                    "duration": duration,
                    "altitude": d["gps"]["altitude"],
                    "distance": d["radar"]["distance"],
                    "avgAltitude": stats["altitude"]["avg"],
                    "avgDistance": stats["radar"]["avg"],
                }
            )

        return {
            "summary": stats,
            "timeSeries": {
                "points": time_series,
                "averages": {
                    "altitude": stats["altitude"]["avg"],
                    "distance": stats["radar"]["avg"],
                },
            },
            "metadata": {
                "duration": flight_duration,
                "totalDistance": total_distance,
                "points": len(data),
            },
        }
    except Exception as e:
        logger.error(f"Error processing data: {e}", exc_info=True)
        raise


async def process_file(file_id: str, file_path: str) -> None:
    """Process uploaded file in background."""
    try:
        logger.info(f"Processing file {file_id} at {file_path}")

        # Get mapping
        mapping_file = settings.UPLOAD_DIR / "file_mapping.json"
        with open(mapping_file, "r") as f:
            mapping = json.load(f)

        # Update status to processing
        if file_id in mapping:
            mapping[file_id]["status"] = "processing"
            with open(mapping_file, "w") as f:
                json.dump(mapping, f, indent=2)

        # Read the source file
        with open(file_path, "r") as f:
            if file_path.endswith(".json"):
                data = json.load(f)
            else:  # CSV handling should be implemented here
                raise NotImplementedError("CSV processing not implemented")

        # Process the data
        processed_data = process_data(data)

        # Save processed results
        results_path = Path(file_path).with_name(Path(file_path).stem + "_results.json")
        with open(results_path, "w") as f:
            json.dump(processed_data, f, indent=2)

        # Update mapping with success status
        if file_id in mapping:
            mapping[file_id]["status"] = "success"
            mapping[file_id]["processed"] = True
            mapping[file_id]["results_path"] = str(results_path)
            with open(mapping_file, "w") as f:
                json.dump(mapping, f, indent=2)

        logger.info(f"Successfully processed file {file_id}")

    except Exception as e:
        logger.error(f"Error processing file {file_id}: {e}", exc_info=True)
        # Update mapping with error status
        if file_id in mapping:
            mapping[file_id]["status"] = "error"
            mapping[file_id]["error"] = str(e)
            with open(mapping_file, "w") as f:
                json.dump(mapping, f, indent=2)
        raise
