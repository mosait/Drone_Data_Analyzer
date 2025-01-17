# backend/app/core/config.py
# This file defines the application's configuration settings using the `BaseSettings` class from Pydantic.
# The following settings are defined:
#
# 1. General Application Settings:
# - `API_V1_STR`: The base URL prefix for API endpoints (default: "/api/v1").
# - `PROJECT_NAME`: The name of the project (default: "Drone Data Analyzer").
#
# 2. Directory Settings:
# - `BASE_DIR`: The base directory of the application (resolved to three levels up from this file's location).
# - `UPLOAD_DIR`: The directory where uploaded files will be stored.
#   - If the `UPLOAD_DIR` does not exist, it is created automatically.
#
# 3. CORS (Cross-Origin Resource Sharing) Settings:
# - `CORS_ORIGINS`: A list of allowed origins for cross-origin requests.
#   - Includes typical development environments (e.g., `localhost:5173`, `localhost:3000`).
#
# 4. File Settings:
# - `MAX_UPLOAD_SIZE`: The maximum allowed size for uploaded files (default: 10MB).
# - `ALLOWED_EXTENSIONS`: The set of allowed file extensions (default: `.csv` and `.json`).
#
# 5. Configuration:
# - The `Config` class sets `case_sensitive` to `True`, ensuring that environment variable names are case-sensitive.
#
# 6. Initialization:
# - Ensures that the `UPLOAD_DIR` exists. If it does not, the directory is created (including parent directories if needed).
# - Creates a `file_mapping.json` file in the `UPLOAD_DIR` if it does not exist.
#   - Initializes this file with an empty JSON object (`{}`).
#
# This configuration module provides centralized and environment-variable-friendly settings management for the application.
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
