# backend/app/api/v1/endpoints/folders.py
# This file defines API endpoints for managing and monitoring directories for new files.
# The following functionalities are implemented:
#
# 1. API Endpoints:
# - **POST `/watch`**:
#   - Accepts a `WatchPathRequest` with a directory path to monitor.
#   - Validates that the provided directory exists.
#   - Configures a `watchdog` observer to monitor the directory for file changes.
#   - The observer listens for new files with `.csv` or `.json` extensions.
#   - Stops any previously running observer before starting a new one.
#   - Returns a success response with the monitored path.
#   - Raises HTTP 400 if the directory does not exist and HTTP 500 for other errors.
#
# - **POST `/scan`**:
#   - Placeholder for directory scanning logic to identify and return a list of new files.
#   - Returns an empty list for now and raises HTTP 500 in case of errors.
#
# 2. File Event Handling:
# - `FileEventHandler` class:
#   - Subclass of `FileSystemEventHandler` to handle filesystem events.
#   - Implements the `on_created` method to detect new files.
#   - Checks the file extension of newly created files (`.csv` or `.json`) and handles them as needed (logic to be implemented).
#
# 3. Observer Management:
# - An instance of `watchdog.observers.Observer` is created to monitor filesystem events.
# - The observer is managed in the `/watch` endpoint:
#   - Stops any previously active observer to avoid conflicts.
#   - Schedules the `FileEventHandler` for the specified directory.
#
# This module enables directory monitoring and provides a foundation for processing uploaded files in real-time.
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os

router = APIRouter()


class WatchPathRequest(BaseModel):
    path: str


class FileEventHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            # Handle new file
            if event.src_path.endswith((".csv", ".json")):
                # Process the file
                pass


observer = Observer()
event_handler = FileEventHandler()


@router.post("/watch")
async def set_watch_path(request: WatchPathRequest):
    try:
        path = request.path
        if not os.path.exists(path):
            raise HTTPException(status_code=400, detail="Directory does not exist")

        # Stop any existing observer
        if observer.is_alive():
            observer.stop()
            observer.join()

        # Start watching new path
        observer.schedule(event_handler, path, recursive=False)
        observer.start()

        return {"success": True, "path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scan")
async def scan_directory():
    try:
        # Implement directory scanning logic
        # Return list of new files found
        return {"success": True, "files": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
