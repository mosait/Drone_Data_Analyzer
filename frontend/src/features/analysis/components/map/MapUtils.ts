// src/features/analysis/components/map/MapUtils.ts
import { DroneData } from "@/api/types";
import L from "leaflet";

export interface MapPoint {
  lat: number;
  lng: number;
  timestamp: string;
  altitude: number;
  distance: number;
}

export function processGPSData(data: DroneData[]): MapPoint[] {
  return data.map(point => ({
    lat: point.gps.latitude,
    lng: point.gps.longitude,
    timestamp: point.timestamp,
    altitude: point.gps.altitude,
    distance: point.radar.distance
  }));
}

export function calculateMapBounds(points: MapPoint[]): L.LatLngBounds {
  if (points.length === 0) {
    return L.latLngBounds([[0, 0], [0, 0]]);
  }
  
  const bounds = L.latLngBounds([points[0].lat, points[0].lng], [points[0].lat, points[0].lng]);
  points.forEach(point => {
    bounds.extend([point.lat, point.lng]);
  });
  return bounds;
}

export function calculateMapCenter(points: MapPoint[]): [number, number] {
  if (points.length === 0) return [0, 0];
  
  const center = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat / points.length,
      lng: acc.lng + point.lng / points.length
    }),
    { lat: 0, lng: 0 }
  );
  
  return [center.lat, center.lng];
}