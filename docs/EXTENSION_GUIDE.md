# Drone Analytics System Extension Guide

## Table of Contents
1. [Adding Database Support](#1-adding-database-support)
2. [Modifying File Structure](#2-modifying-file-structure)
3. [Adding New Sensors](#3-adding-new-sensors)
4. [Supporting Multi-dimensional Data](#4-supporting-multi-dimensional-data)

## 1. Adding Database Support

### Backend Changes

#### 1.1 Database Setup
1. Create a new directory `app/db/` with the following structure:
```
app/db/
├── database.py    # Database connection
├── models.py      # SQLAlchemy/ORM models
└── crud.py       # CRUD operations
```

2. Add database configuration in `app/core/config.py`:
```python
class Settings(BaseSettings):
    # ... existing settings ...
    DATABASE_URL: str = "postgresql://user:password@localhost/dbname"
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10
```

3. Create database models in `app/db/models.py`:
```python
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class DroneData(Base):
    __tablename__ = "drone_data"
    
    id = Column(Integer, primary_key=True)
    file_id = Column(String, index=True)
    timestamp = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)
    altitude = Column(Float)
    radar_distance = Column(Float)
```

#### 1.2 Service Layer Modifications
1. Update `app/services/data_processing.py`:
```python
async def process_file(file_id: str, file_path: Path):
    data = read_file_content(file_path)
    # Store in database instead of file system
    async with get_db() as db:
        for record in data:
            db_record = DroneData(
                file_id=file_id,
                timestamp=record["timestamp"],
                latitude=record["gps"]["latitude"],
                longitude=record["gps"]["longitude"],
                altitude=record["gps"]["altitude"],
                radar_distance=record["radar"]["distance"]
            )
            db.add(db_record)
        await db.commit()
```

#### 1.3 API Endpoint Updates
1. Modify `app/api/v1/endpoints/data.py`:
```python
@router.get("/{file_id}")
async def get_data(file_id: str, db: Session = Depends(get_db)):
    data = await db.query(DroneData).filter(DroneData.file_id == file_id).all()
    return {"data": data}
```

### Frontend Changes

Minimal frontend changes required as the API interface remains the same. However:

1. Update error handling in `src/api/client.ts`:
```typescript
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 503) {
            // Handle database connection errors
            return Promise.reject(new Error("Database connection error"));
        }
        return Promise.reject(error);
    }
);
```

## 2. Modifying File Structure

### Backend Changes

#### 2.1 Data Models
1. Update `app/models/drone_data.py`:
```python
class GPSData(BaseModel):
    # Add or modify fields
    latitude: float
    longitude: float
    altitude: float
    speed: float  # New field example
    heading: float  # New field example

class DroneData(BaseModel):
    timestamp: datetime
    gps: GPSData
    radar: RadarData
    # Add new top-level fields as needed
```

#### 2.2 File Validation
1. Update `app/utils/file_validator.py`:
```python
def validate_csv_structure(df: pd.DataFrame) -> Tuple[bool, str]:
    required_columns = {
        "timestamp",
        "latitude",
        "longitude",
        "altitude",
        "speed",        # New field
        "heading",      # New field
        "radar_distance"
    }
    # Update validation logic
```

#### 2.3 Data Processing
1. Modify `app/services/data_processing.py`:
```python
def process_csv_row(row: dict) -> dict:
    return {
        "timestamp": row["timestamp"],
        "gps": {
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "altitude": float(row["altitude"]),
            "speed": float(row["speed"]),      # New field
            "heading": float(row["heading"])    # New field
        },
        "radar": {
            "distance": float(row["radar_distance"])
        }
    }
```

### Frontend Changes

#### 2.1 Type Definitions
1. Update `src/api/types.ts`:
```typescript
interface GPSData {
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;     // New field
    heading: number;   // New field
}

interface DroneData {
    timestamp: string;
    gps: GPSData;
    radar: RadarData;
}
```

#### 2.2 Data Table
1. Update `src/features/data-table/components/Columns.tsx`:
```typescript
export const columns: ColumnDef<DroneData>[] = [
    // ... existing columns ...
    {
        accessorKey: "gps.speed",
        header: "Speed",
        cell: ({ row }) => (
            <div className={columnClass}>
                {row.original.gps?.speed.toFixed(1)} m/s
            </div>
        )
    },
    {
        accessorKey: "gps.heading",
        header: "Heading",
        cell: ({ row }) => (
            <div className={columnClass}>
                {row.original.gps?.heading.toFixed(1)}°
            </div>
        )
    }
];
```

## 3. Adding New Sensors

### Backend Changes

#### 3.1 Data Models
1. Add new sensor model in `app/models/drone_data.py`:
```python
class TemperatureSensorData(BaseModel):
    ambient: float
    internal: float
    humidity: float

class DroneData(BaseModel):
    timestamp: datetime
    gps: GPSData
    radar: RadarData
    temperature: TemperatureSensorData  # New sensor
```

#### 3.2 File Validation
1. Update CSV validation in `app/utils/file_validator.py`:
```python
def validate_csv_structure(df: pd.DataFrame) -> Tuple[bool, str]:
    required_columns = {
        # ... existing columns ...
        "temp_ambient",
        "temp_internal",
        "humidity"
    }
```

#### 3.3 Data Processing
1. Update processing in `app/services/data_processing.py`:
```python
def calculate_metrics(data: List[dict]) -> dict:
    metrics = {
        # ... existing metrics ...
        "temperature": {
            "max_ambient": max(d["temperature"]["ambient"] for d in data),
            "avg_ambient": sum(d["temperature"]["ambient"] for d in data) / len(data),
            "max_internal": max(d["temperature"]["internal"] for d in data)
        }
    }
    return metrics
```

### Frontend Changes

#### 3.1 Type Definitions
1. Update `src/api/types.ts`:
```typescript
interface TemperatureSensorData {
    ambient: number;
    internal: number;
    humidity: number;
}

interface DroneData {
    timestamp: string;
    gps: GPSData;
    radar: RadarData;
    temperature: TemperatureSensorData;
}
```

#### 3.2 Visualization
1. Create new chart component `src/features/analysis/components/charts/TemperatureChart.tsx`:
```typescript
export function TemperatureChart({ data }: { data: DroneData[] }) {
    return (
        <ComposedChart data={data}>
            <Line type="monotone" dataKey="temperature.ambient" stroke="#8884d8" />
            <Line type="monotone" dataKey="temperature.internal" stroke="#82ca9d" />
            <Line type="monotone" dataKey="temperature.humidity" stroke="#ffc658" />
        </ComposedChart>
    );
}
```

## 4. Supporting Multi-dimensional Data

### Backend Changes

#### 4.1 Data Models
1. Update `app/models/drone_data.py`:
```python
class RadarData(BaseModel):
    distances: List[float]    # Array of distances
    angles: List[float]       # Array of angles
    signal_strengths: List[float]  # Array of signal strengths

class DroneData(BaseModel):
    timestamp: datetime
    gps: GPSData
    radar: RadarData
```

#### 4.2 CSV Structure
For multi-dimensional data in CSV, use these approaches:

1. **Array Columns**: Use semicolon-separated values within a cell
```csv
timestamp,latitude,longitude,radar_distances,radar_angles
2024-01-01 12:00:00,48.7758,9.1829,"10.5;12.3;9.8","45;90;135"
```

2. **Multiple Columns**: Split arrays into numbered columns
```csv
timestamp,latitude,longitude,radar_distance_1,radar_angle_1,radar_distance_2,radar_angle_2
2024-01-01 12:00:00,48.7758,9.1829,10.5,45,12.3,90
```

3. Update CSV parsing in `app/services/data_processing.py`:
```python
def parse_csv_row(row: dict) -> dict:
    # For semicolon-separated approach
    radar_distances = [float(x) for x in row["radar_distances"].split(";")]
    radar_angles = [float(x) for x in row["radar_angles"].split(";")]
    
    # For multiple columns approach
    radar_data = []
    for i in range(1, MAX_RADAR_POINTS + 1):
        if f"radar_distance_{i}" in row:
            radar_data.append({
                "distance": float(row[f"radar_distance_{i}"]),
                "angle": float(row[f"radar_angle_{i}"])
            })
    
    return {
        "timestamp": row["timestamp"],
        "gps": {
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"])
        },
        "radar": {
            "data": radar_data
        }
    }
```

### Frontend Changes

#### 4.1 Type Definitions
1. Update `src/api/types.ts`:
```typescript
interface RadarPoint {
    distance: number;
    angle: number;
    signalStrength: number;
}

interface RadarData {
    data: RadarPoint[];
}

interface DroneData {
    timestamp: string;
    gps: GPSData;
    radar: RadarData;
}
```

#### 4.2 Visualization
1. Create radar visualization in `src/features/analysis/components/charts/RadarScanChart.tsx`:
```typescript
export function RadarScanChart({ data }: { data: DroneData }) {
    const radarPoints = data.radar.data;
    
    // Convert polar coordinates to cartesian
    const points = radarPoints.map(point => ({
        x: point.distance * Math.cos(point.angle * Math.PI / 180),
        y: point.distance * Math.sin(point.angle * Math.PI / 180),
        strength: point.signalStrength
    }));

    return (
        <ScatterChart width={400} height={400}>
            <XAxis type="number" dataKey="x" />
            <YAxis type="number" dataKey="y" />
            <Scatter
                data={points}
                fill="#8884d8"
                fillOpacity={0.6}
            />
        </ScatterChart>
    );
}
```

#### 4.3 Data Table
1. Update `src/features/data-table/components/Columns.tsx`:
```typescript
export const columns: ColumnDef<DroneData>[] = [
    // ... existing columns ...
    {
        accessorKey: "radar.data",
        header: "Radar Points",
        cell: ({ row }) => {
            const points = row.original.radar.data;
            return (
                <div className={columnClass}>
                    {points.length} points
                    <Button
                        onClick={() => showRadarDetails(points)}
                        variant="ghost"
                        size="sm"
                    >
                        View Details
                    </Button>
                </div>
            );
        }
    }
];
```

This guide should help developers understand where and how to make necessary changes for each extension scenario. Remember to maintain type safety and data validation throughout the changes, and update tests accordingly.
