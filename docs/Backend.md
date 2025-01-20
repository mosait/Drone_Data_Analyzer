# Drone Analytics Backend Documentation

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [File Processing Pipeline](#file-processing-pipeline)
6. [API Endpoints](#api-endpoints)
7. [Error Handling](#error-handling)
8. [Configuration](#configuration)

## Overview

The backend system is built using FastAPI and handles drone flight data in both CSV and JSON formats. It provides endpoints for file upload, processing, analysis, and data export. The system follows a modular architecture with clear separation of concerns.

### Key Features

- File upload and validation
- Asynchronous file processing
- Data analysis and metrics calculation
- Data export in multiple formats
- File management and cleanup

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           ├── data.py      # Data retrieval and export
│   │           ├── files.py     # File upload and management
│   │           └── folders.py   # Directory monitoring
│   ├── core/
│   │   └── config.py           # Configuration settings
│   ├── models/
│   │   └── drone_data.py       # Data models
│   ├── services/
│   │   └── data_processing.py  # Data processing logic
│   └── utils/
│       ├── file_handlers.py    # File handling utilities
│       └── file_validator.py   # File validation logic
└── main.py                     # Application entry point
```

## Core Components

### 1. File Management System

- Located in: `app/api/v1/endpoints/files.py`
- Handles file uploads, tracking, and deletion
- Uses `file_mapping.json` to maintain file metadata
- Key functions:
  ```python
  async def upload_file(file: UploadFile)  # Handles file upload
  async def list_files()                   # Lists all uploaded files
  async def delete_file(file_id: str)      # Deletes file and associated data
  ```

### 2. Data Processing Engine

- Located in: `app/services/data_processing.py`
- Processes uploaded files asynchronously
- Calculates metrics and prepares data for analysis
- Key functions:
  ```python
  def read_file_content(file_path: Path)   # Reads and parses file content
  async def process_file(file_id: str)     # Main processing pipeline
  def calculate_metrics(data: List[dict])  # Calculates flight metrics
  ```

### 3. Validation System

- Located in: `app/utils/file_validator.py`
- Validates file content and structure
- Ensures data integrity and format consistency
- Key function:
  ```python
  async def validate_file_content(file, max_size: int) -> Tuple[bool, str]
  ```

## Data Flow

1. **File Upload**

   ```mermaid
   graph LR
       A[Client] --> B[Upload Endpoint]
       B --> C{Validation}
       C -->|Valid| D[Save File]
       D --> E[Update Mapping]
       E --> F[Background Processing]
       C -->|Invalid| G[Error Response]
   ```

2. **Data Processing**
   - File is saved to `UPLOAD_DIR` with timestamp prefix
   - Metadata is stored in `file_mapping.json`
   - Background task processes the file asynchronously
   - Processed data is saved as `{original_name}_processed.json`

## File Processing Pipeline

### 1. Upload Phase

```python
# 1. Validate file content
is_valid, error = await validate_file_content(file)

# 2. Generate unique ID and save file
file_id = str(uuid.uuid4())
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
save_filename = f"{timestamp}_{original_filename}"

# 3. Save file in chunks
with open(file_path, "wb") as buffer:
    while chunk := await file.read(8192):  # 8KB chunks
        buffer.write(chunk)

# 4. Update mapping
mapping[file_id] = {
    "filename": original_filename,
    "timestamp": datetime.now().isoformat(),
    "path": str(file_path),
    "id": file_id,
    "status": "pending"
}
```

### 2. Processing Phase

```python
# 1. Read file content based on type
data = read_file_content(file_path)

# 2. Calculate metrics
metrics = calculate_metrics(data)

# 3. Save processed results
processed_path = file_path.with_name(f"{file_path.stem}_processed.json")
with open(processed_path, "w") as f:
    json.dump(data, f, indent=2)
```

## API Endpoints

### File Management

```
POST /api/v1/files/upload
- Uploads new file
- Returns: { id, filename, timestamp, status }

GET /api/v1/files
- Lists all uploaded files
- Returns: [{ id, filename, timestamp, status }]

DELETE /api/v1/files/{file_id}
- Deletes file and associated data
- Returns: { success, message, deleted_files }
```

### Data Access

```
GET /api/v1/data/{file_id}
- Retrieves processed data
- Optional query params: start_time, end_time
- Returns: { data, metrics }

GET /api/v1/data/{file_id}/export
- Exports data in CSV or JSON format
- Query param: format=csv|json
- Returns: File download
```

## Error Handling

The system implements comprehensive error handling:

1. **File Validation Errors**

   - Max file size (10MB default)
   - File type validation
   - Content structure validation
   - Format-specific validations (CSV columns, JSON structure)

2. **Processing Errors**

   - File read/write errors
   - Data parsing errors
   - Metric calculation errors

3. **HTTP Error Responses**
   ```python
   400 - Bad Request (Invalid file format/content)
   404 - Not Found (File not found)
   413 - Payload Too Large (File too big)
   415 - Unsupported Media Type (Wrong file type)
   500 - Internal Server Error (Processing failures)
   ```

## Configuration

Located in `app/core/config.py`, key settings include:

```python
class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Drone Data Analyzer"
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".csv", ".json"}
```

### Environment Variables

- Configure these variables for deployment:
  ```
  CORS_ORIGINS=["http://localhost:5173", ...]
  MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
  UPLOAD_DIR=/path/to/uploads
  ```

## Implementation Notes

1. **File Naming Convention**

   - Files are saved with timestamp prefix: `YYYYMMDD_HHMMSS_originalname`
   - Processed files use suffix: `_processed.json`

2. **Background Processing**

   - Uses FastAPI background tasks for async processing
   - Status tracked in file mapping: pending → processing → complete

3. **Data Validation**

   - CSV headers validated against required columns
   - JSON structure validated against schema
   - Numeric values validated for correct types

4. **Performance Considerations**
   - Files read in chunks (8KB) to manage memory
   - Asynchronous processing for large files
   - File mapping used as lightweight database

## Maintenance Tasks

1. **Regular Cleanup**

   - Implement periodic cleanup of old files
   - Monitor disk space usage
   - Archive or delete processed files

2. **Error Monitoring**

   - Check logs for validation failures
   - Monitor processing errors
   - Track file processing times

3. **Performance Optimization**
   - Adjust chunk size for file reading
   - Monitor memory usage
   - Optimize metric calculations

## Extending the System

To add new features:

1. **New File Types**

   - Add extension to `ALLOWED_EXTENSIONS`
   - Implement parser in `file_handlers.py`
   - Add validation rules in `file_validator.py`

2. **New Metrics**

   - Add calculation in `calculate_metrics()`
   - Update response models in `drone_data.py`
   - Add to API response schema

3. **New Endpoints**
   - Add route in appropriate endpoint file
   - Implement validation and processing
   - Update API documentation
