# backend/app/api/v1/endpoints/folders.py
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
