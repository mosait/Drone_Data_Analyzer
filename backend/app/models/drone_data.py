# backend/app/models/drone_data.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class GPSData(BaseModel):
    latitude: float = Field(..., description="Latitude in degrees")
    longitude: float = Field(..., description="Longitude in degrees")


class RadarData(BaseModel):
    distance: float = Field(..., description="Distance to nearest object in meters")
    velocity: float = Field(..., description="Relative velocity in m/s")


class DroneData(BaseModel):
    timestamp: datetime
    altitude: float = Field(..., description="Altitude in meters")
    gps: GPSData
    radar: RadarData


class DroneDataList(BaseModel):
    data: List[DroneData]


class AnalysisResult(BaseModel):
    max_altitude: float
    avg_altitude: float
    flight_duration: float  # in seconds
    total_distance: float  # in meters
    avg_speed: float  # in m/s
    min_distance: float  # closest approach to any object
