# backend/app/api/v1/endpoints/data.py
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pathlib import Path
from typing import Optional, List
from ....models.drone_data import DroneData
from ....services.data_processing import DroneDataProcessor
from ....utils.file_handlers import parse_file
from datetime import datetime

router = APIRouter()


@router.get("/{file_id}")
async def get_data(
    file_id: str,
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    include_summary: bool = Query(True),
):
    """
    Get processed drone data for a specific file.
    Optionally filter by time range and include/exclude summary statistics.
    """
    try:
        # Get file info from storage (you should implement proper file storage)
        file_path = Path(f"uploads/{file_id}")
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        # Parse the file
        drone_data = parse_file(file_path)

        # Apply time filters if provided
        filtered_data = drone_data.data
        if start_time:
            filtered_data = [d for d in filtered_data if d.timestamp >= start_time]
        if end_time:
            filtered_data = [d for d in filtered_data if d.timestamp <= end_time]

        # Process the data
        processor = DroneDataProcessor()
        result = processor.process_flight_data(filtered_data)

        # Return based on include_summary flag
        if not include_summary:
            return JSONResponse(content={"data": result["processed_data"]})

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{file_id}/summary")
async def get_summary(file_id: str):
    """
    Get only the summary statistics for a specific file.
    """
    try:
        # Get file info from storage
        file_path = Path(f"uploads/{file_id}")
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        # Parse and process the data
        drone_data = parse_file(file_path)
        processor = DroneDataProcessor()
        result = processor.process_flight_data(drone_data.data)

        return JSONResponse(content={"summary": result["summary"]})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{file_id}/timerange")
async def get_time_range(file_id: str, start_time: datetime, end_time: datetime):
    """
    Get data for a specific time range.
    """
    try:
        # Get file info from storage
        file_path = Path(f"uploads/{file_id}")
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        # Parse the file
        drone_data = parse_file(file_path)

        # Filter data by time range
        filtered_data = [
            d for d in drone_data.data if start_time <= d.timestamp <= end_time
        ]

        # Process the filtered data
        processor = DroneDataProcessor()
        result = processor.process_flight_data(filtered_data)

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
