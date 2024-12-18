# backend/app/core/config.py
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Drone Data Analyzer"
    UPLOAD_DIR: str = "uploads"

    # CORS settings
    CORS_ORIGINS: list = ["http://localhost:5173"]

    # File settings
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".csv", ".json"}


settings = Settings()

# Ensure upload directory exists
if not Path(settings.UPLOAD_DIR).exists():
    Path(settings.UPLOAD_DIR).mkdir(parents=True)
