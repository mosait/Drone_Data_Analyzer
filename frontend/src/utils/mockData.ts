// src/utils/mockData.ts
import { DroneData } from '../api/types';

const generateFlightPath = (numPoints: number): DroneData[] => {
  const startTime = new Date('2024-01-01T10:00:00');
  const data: DroneData[] = [];

  // Flight parameters
  const startLat = 48.7758;
  const startLng = 9.1829;
  const radius = 0.01; // Roughly 1km

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const time = new Date(startTime.getTime() + i * 30000); // 30 second intervals
    
    // Create circular flight path
    const lat = startLat + radius * Math.cos(angle);
    const lng = startLng + radius * Math.sin(angle);
    
    // Simulate altitude changes
    const altitude = 100 + 50 * Math.sin(angle * 2);
    
    // Simulate radar data
    const distance = 50 + 20 * Math.sin(angle * 3);

    data.push({
      timestamp: time.toISOString(),
      gps: {
        latitude: lat,
        longitude: lng,
        altitude: altitude
      },
      radar: {
        distance: distance
      },
      altitude: altitude // This is redundant with gps.altitude but matches the interface
    });
  }

  return data;
};

export const mockFlightData = generateFlightPath(120); // 1 hour of data