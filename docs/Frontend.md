# Drone Analytics Frontend Documentation

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [State Management](#state-management)
5. [Key Features](#key-features)
6. [UI Components](#ui-components)
7. [Data Visualization](#data-visualization)
8. [Styling System](#styling-system)

## Overview

The frontend is built using React + TypeScript + Vite, with a focus on data visualization and analysis of drone flight data. The application uses modern React patterns including hooks, context, and component composition.

### Key Technologies

- React 18.3
- TypeScript
- Vite
- TailwindCSS
- Zustand (State Management)
- Recharts (Data Visualization)
- React Router DOM
- ShadcnUI Components

## Project Structure

```
src/
├── api/
│   ├── client.ts          # Axios configuration
│   ├── endpoints.ts       # API endpoint definitions
│   └── types.ts          # API response types
├── components/
│   ├── shared/           # Reusable components
│   ├── ui/              # Base UI components
│   └── theme/           # Theme configuration
├── features/
│   ├── analysis/        # Analysis view components
│   ├── dashboard/       # Dashboard components
│   └── data-table/      # Data table components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── store/              # Zustand store
└── types/              # TypeScript definitions
```

## Core Components

### 1. Data Store

Located in `src/store/useDataStore.ts`, the data store manages:

- File slots management (2 slots for comparison)
- File upload state
- Current data mapping
- Recent files list

```typescript
interface DataState {
  fileSlots: FileSlots;
  currentDataMap: Record<string, DroneData[]>;
  metricsMap: Record<string, MetricsData>;
  recentFiles: FileUploadResponse[];
  error: string | null;
  isLoading: boolean;
  uploadProgress: number;
}
```

### 2. File Management System

Key components:

- `FileUpload.tsx`: Handles file upload with drag-and-drop
- `FileSlotDialog.tsx`: Manages file slot assignment
- `FolderMonitor.tsx`: Monitors directories for new files

Example usage:

```typescript
const { uploadFile, addFileToSlot } = useDataStore();

const handleFileUpload = async (file: File) => {
  const response = await uploadFile(file);
  await addFileToSlot(response, 1); // Add to slot 1
};
```

### 3. Analysis Components

Located in `src/features/analysis/`:

- `AllDataView.tsx`: Combined visualization
- `AltitudeAnalysisView.tsx`: Altitude-specific analysis
- `RadarAnalysisView.tsx`: Radar data analysis
- `GPSTrackView.tsx`: GPS visualization

## State Management

### 1. Zustand Store

The application uses Zustand for state management with the following key slices:

```typescript
// File Management
fileSlots: {
  slot1: FileUploadResponse | null;
  slot2: FileUploadResponse | null;
};

// Data Management
currentDataMap: Record<string, DroneData[]>;
metricsMap: Record<string, MetricsData>;

// Actions
uploadFile: (file: File) => Promise<FileUploadResponse>;
addFileToSlot: (file: FileUploadResponse, slot: 1 | 2) => Promise<void>;
removeFileFromSlot: (slot: 1 | 2) => void;
```

### 2. Local Storage Integration

Custom hook for persistent storage:

```typescript
const [storedValue, setValue] = useLocalStorage<T>(key, initialValue);
```

## Key Features

### 1. File Upload System

Multiple upload methods:

- Drag and drop interface
- File selection dialog
- Directory monitoring

```typescript
// File validation
if (!file.name.match(/\.(csv|json)$/i)) {
  throw new Error("Invalid File Type");
}

if (file.size > 10 * 1024 * 1024) {
  throw new Error("File Too Large");
}
```

### 2. Data Visualization

Components in `src/features/analysis/components/charts/`:

- `CombinedAltitudeChart.tsx`: Altitude comparison
- `CombinedRadarChart.tsx`: Radar data comparison
- `SingleAltitudeChart.tsx`: Single file altitude
- `SingleRadarChart.tsx`: Single file radar

Example chart configuration:

```typescript
<ComposedChart data={chartData}>
  <defs>
    <linearGradient id="colorAlt1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8} />
      <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="time" />
  <YAxis label={{ value: "Altitude (m)", angle: -90 }} />
  <Tooltip content={CustomTooltip} />
  <Area type="monotone" dataKey="altitude" fill="url(#colorAlt1)" />
</ComposedChart>
```

### 3. Data Table System

Features:

- Sortable columns
- Filtering
- Pagination
- Synchronized scrolling
- Export functionality

## UI Components

### 1. Base Components

Located in `src/components/ui/`:

- Button
- Card
- Dialog
- Input
- Select
- Table

Example usage:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Flight Metrics</CardTitle>
  </CardHeader>
  <CardContent>
    <MetricsDisplay data={metrics} />
  </CardContent>
</Card>
```

### 2. Layout Components

- `Layout.tsx`: Main application layout
- `Navbar.tsx`: Navigation and file slots
- `Sidebar.tsx`: Navigation menu

### 3. Feature Components

Dashboard components:

- `FlightComparison.tsx`: File comparison
- `ProcessingStatus.tsx`: Upload status
- `QuickActions.tsx`: Common actions
- `RecentFiles.tsx`: File history

## Data Visualization

### 1. Map Visualization

Using React-Leaflet for GPS tracking:

```typescript
<MapContainer center={mapData.center} zoom={defaultZoom}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Polyline positions={mapData.path1} color="#A855F7" />
  <Markers data={mapData.points} />
</MapContainer>
```

### 2. Chart Synchronization

Chart synchronization using the ChartWrapper:

```typescript
<ChartWrapper onSync={syncHoverProps.onHover}>
  <CombinedAltitudeChart
    data1={data1}
    data2={data2}
    syncHover={syncHoverProps}
  />
</ChartWrapper>
```

## Styling System

### 1. TailwindCSS Configuration

Located in `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        // ... other color definitions
      },
    },
  },
};
```

### 2. Theme System

Dark/Light mode support:

```typescript
const ThemeProvider = ({
  children,
  defaultTheme = "light",
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  // ... theme implementation
};
```

## Error Handling

### 1. Error Boundaries

Global error handling:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 2. API Error Handling

Centralized error formatting:

```typescript
const formatErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    return `Validation Error: ${error.response.data.detail}`;
  }
  return "An unexpected error occurred";
};
```

## Implementation Notes

### 1. Performance Optimization

- Debounced inputs
- Memoized calculations
- Virtualized tables for large datasets

### 2. File Processing

Files are processed in steps:

1. Upload and validation
2. Slot assignment
3. Data processing
4. Metrics calculation
5. Visualization preparation

### 3. Chart Synchronization

Charts are synchronized using:

- Shared hover state
- Synchronized tooltips
- Common zoom levels

## Extending the System

### 1. Adding New Visualizations

1. Create new chart component
2. Add to relevant view
3. Connect to data store
4. Add synchronization if needed

### 2. Adding New Features

1. Create feature folder
2. Add to routing
3. Connect to store
4. Add UI components

### 3. Styling New Components

1. Use Tailwind classes
2. Follow theme system
3. Ensure responsive design
4. Add dark mode support

## Maintenance Tasks

### 1. Regular Updates

- Keep dependencies updated
- Check for type definition updates
- Monitor performance metrics

### 2. Code Quality

- Run TypeScript checks
- Maintain test coverage
- Follow ESLint rules

### 3. Performance Monitoring

- Check React DevTools
- Monitor memory usage
- Track render cycles

## Development Workflow

### 1. Starting Development

```bash
npm install
npm run dev
```

### 2. Building for Production

```bash
npm run build
npm run preview
```

### 3. Environment Configuration

Required environment variables:

```env
VITE_API_URL=http://localhost:8000
VITE_MAX_UPLOAD_SIZE=10485760
```
