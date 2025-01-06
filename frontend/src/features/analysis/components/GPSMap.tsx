// src/features/analysis/components/GPSMap.tsx
import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DroneData } from '@/api/types';

interface GPSMapProps {
  data: DroneData[];
}

const GPSMap = ({ data }: GPSMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Calculate center point
    const centerLat = data.reduce((sum, point) => sum + point.gps.latitude, 0) / data.length;
    const centerLng = data.reduce((sum, point) => sum + point.gps.longitude, 0) / data.length;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: true
    });
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create flight path
    const pathPoints = data.map(point => [point.gps.latitude, point.gps.longitude]);
    const flightPath = L.polyline(pathPoints as L.LatLngExpression[], {
      color: '#8884d8',
      weight: 3
    }).addTo(map);

    // Add markers for start and end
    const startPoint = data[0];
    const endPoint = data[data.length - 1];

    L.marker([startPoint.gps.latitude, startPoint.gps.longitude])
      .bindPopup(`Start<br/>Altitude: ${startPoint.gps.altitude.toFixed(1)}m`)
      .addTo(map);

    L.marker([endPoint.gps.latitude, endPoint.gps.longitude])
      .bindPopup(`End<br/>Altitude: ${endPoint.gps.altitude.toFixed(1)}m`)
      .addTo(map);

    // Fit bounds to show all points
    map.fitBounds(flightPath.getBounds(), { padding: [50, 50] });

    // Force a map refresh after mounting
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>GPS Track</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] bg-white">
        <div ref={mapRef} className="w-full h-full rounded-md" />
      </CardContent>
    </Card>
  );
};

export default GPSMap;