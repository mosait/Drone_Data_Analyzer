# backend/app/services/data_processing.py
import pandas as pd
import numpy as np
from typing import List, Dict
from pathlib import Path
from ..models.drone_data import DroneData, AnalysisResult
from ..utils.file_handlers import parse_file
import json


class DroneDataProcessor:
    @staticmethod
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

    @staticmethod
    def process_data(data: List[DroneData]) -> Dict:
        """Process drone data and generate analysis results."""
        # Calculate time-based metrics
        timestamps = pd.to_datetime([d.timestamp for d in data])
        flight_duration = (timestamps.max() - timestamps.min()).total_seconds()

        # Calculate total distance traveled
        total_distance = 0
        for i in range(1, len(data)):
            total_distance += DroneDataProcessor.calculate_distance(
                data[i - 1].gps.latitude,
                data[i - 1].gps.longitude,
                data[i].gps.latitude,
                data[i].gps.longitude,
            )

        # Calculate metrics
        altitudes = [d.gps.altitude for d in data]
        radar_distances = [d.radar.distance for d in data]

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
        time_series = []
        base_time = timestamps.min()
        for i, d in enumerate(data):
            duration = (
                timestamps[i] - base_time
            ).total_seconds() / 60  # Convert to minutes
            time_series.append(
                {
                    "duration": duration,
                    "altitude": d.gps.altitude,
                    "distance": d.radar.distance,
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
        }


async def process_file(file_id: str, file_path: Path) -> None:
    """Process uploaded file in background."""
    try:
        # Parse the file into DroneData objects
        drone_data = parse_file(file_path)

        # Process the data
        processor = DroneDataProcessor()
        result = processor.process_data(drone_data.data)

        # Save results to a file
        result_path = Path(str(file_path).replace(file_path.suffix, "_results.json"))
        with open(result_path, "w") as f:
            json.dump(result, f, indent=2)

    except Exception as e:
        print(f"Error processing file {file_id}: {str(e)}")
        # In a production environment, you might want to:
        # 1. Log the error properly
        # 2. Update a file status in database
        # 3. Notify admins
        # 4. Create an error report file
        raise e
