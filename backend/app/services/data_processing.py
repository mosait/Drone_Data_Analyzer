# backend/app/services/data_processing.py
import pandas as pd
import numpy as np
from typing import List, Dict
from ..models.drone_data import DroneData, AnalysisResult


class DroneDataProcessor:
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two GPS coordinates"""
        # Haversine formula implementation
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
    def process_data(data: List[DroneData]) -> AnalysisResult:
        """Process drone data and generate analysis results"""
        # Extract timestamps and convert to datetime
        timestamps = pd.to_datetime([d.timestamp for d in data])

        # Calculate flight duration
        flight_duration = (timestamps.max() - timestamps.min()).total_seconds()

        # Calculate total distance
        total_distance = 0
        for i in range(1, len(data)):
            total_distance += DroneDataProcessor.calculate_distance(
                data[i - 1].gps.latitude,
                data[i - 1].gps.longitude,
                data[i].gps.latitude,
                data[i].gps.longitude,
            )

        # Calculate other metrics
        altitudes = [d.altitude for d in data]
        velocities = [d.radar.velocity for d in data]
        distances = [d.radar.distance for d in data]

        return AnalysisResult(
            max_altitude=max(altitudes),
            avg_altitude=sum(altitudes) / len(altitudes),
            flight_duration=flight_duration,
            total_distance=total_distance,
            avg_speed=sum(velocities) / len(velocities),
            min_distance=min(distances),
        )


async def process_file(file_id: str, file_path: str):
    """Process uploaded file in background"""
    try:
        # Read and parse file
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:  # JSON
            df = pd.read_json(file_path)

        # Convert to DroneData objects
        drone_data = [
            DroneData(
                timestamp=row["timestamp"],
                altitude=row["altitude"],
                gps={"latitude": row["latitude"], "longitude": row["longitude"]},
                radar={"distance": row["distance"], "velocity": row["velocity"]},
            )
            for _, row in df.iterrows()
        ]

        # Process data
        processor = DroneDataProcessor()
        result = processor.process_data(drone_data)

        # Store results (implement database storage here)
        # For now, save to a results file
        result_path = file_path.replace(".csv", "_results.json").replace(
            ".json", "_results.json"
        )
        with open(result_path, "w") as f:
            f.write(result.json())

    except Exception as e:
        print(f"Error processing file {file_id}: {str(e)}")
        # Log error and update file status
