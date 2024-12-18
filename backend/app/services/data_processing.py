# backend/app/services/data_processing.py
from math import sin, cos, sqrt, atan2, radians
import numpy as np
from typing import List
from app.models.drone_data import DroneData


class DroneDataProcessor:
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371e3  # Earth's radius in meters
        φ1 = radians(lat1)
        φ2 = radians(lat2)
        Δφ = radians(lat2 - lat1)
        Δλ = radians(lon2 - lon1)

        a = sin(Δφ / 2) * sin(Δφ / 2) + cos(φ1) * cos(φ2) * sin(Δλ / 2) * sin(Δλ / 2)
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return R * c

    @staticmethod
    def process_flight_data(data: List[DroneData]):
        # Pre-calculate all metrics at once
        total_distance = 0
        altitudes = []
        velocities = []
        distances = []

        for i in range(1, len(data)):
            total_distance += DroneDataProcessor.calculate_distance(
                data[i - 1].gps.latitude,
                data[i - 1].gps.longitude,
                data[i].gps.latitude,
                data[i].gps.longitude,
            )
            altitudes.append(data[i].altitude)
            velocities.append(data[i].radar.velocity)
            distances.append(data[i].radar.distance)

        return {
            "summary": {
                "total_distance": total_distance,
                "flight_time": (data[-1].timestamp - data[0].timestamp).total_seconds(),
                "max_altitude": max(altitudes),
                "max_velocity": max(velocities),
                "min_distance": min(distances),
                "avg_altitude": np.mean(altitudes),
                "avg_velocity": np.mean(velocities),
                "avg_distance": np.mean(distances),
            },
            "processed_data": data,  # Add any data transformations needed
        }
