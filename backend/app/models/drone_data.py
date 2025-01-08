# backend/app/models/drone_data.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List


class GPSData(BaseModel):
    latitude: float = Field(..., description="Latitude in degrees")
    longitude: float = Field(..., description="Longitude in degrees")
    altitude: float = Field(..., description="Altitude in meters")


class RadarData(BaseModel):
    distance: float = Field(..., description="Distance to nearest object in meters")


class DroneData(BaseModel):
    timestamp: datetime
    gps: GPSData
    radar: RadarData


class DroneDataList(BaseModel):
    data: List[DroneData]


class AnalysisResult(BaseModel):
    max_altitude: float
    avg_altitude: float
    flight_duration: float  # in seconds
    total_distance: float  # in meters
    min_distance: float  # closest approach to any object
