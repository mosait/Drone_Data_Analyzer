# backend/app/core/config.py
from pydantic_settings import BaseSettings
from pathlib import Path
import os


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Drone Data Analyzer"

    # Directory Settings
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"

    # CORS Settings
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # File Settings
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".csv", ".json"}

    class Config:
        case_sensitive = True


# Create settings instance
settings = Settings()

# Ensure upload directory exists
if not settings.UPLOAD_DIR.exists():
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Ensure file mapping exists
mapping_file = settings.UPLOAD_DIR / "file_mapping.json"
if not mapping_file.exists():
    with open(mapping_file, "w") as f:
        import json

        json.dump({}, f)
