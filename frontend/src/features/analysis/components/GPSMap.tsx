// src/features/analysis/components/GPSMap.tsx
import { useEffect, useMemo, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline, Marker, Popup, ZoomControl } from 'react-leaflet';
import type { DroneData } from "@/api/types";

interface GPSMapProps {
  data: DroneData[];
}

const GPSMap = ({ data }: GPSMapProps) => {
  const [selectedPoint, setSelectedPoint] = useState<DroneData | null>(null);
  const mapRef = useRef<L.Map>(null);
  const defaultZoom = 15;

  // Calculate path and center
  const flightInfo = useMemo(() => {
    const points = data.map(point => [point.gps.latitude, point.gps.longitude] as [number, number]);
    const center = points.reduce(
      (acc, [lat, lng]) => [acc[0] + lat / points.length, acc[1] + lng / points.length],
      [0, 0]
    );
    
    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += L.latLng(points[i-1]).distanceTo(L.latLng(points[i]));
    }

    // Calculate time difference between first and last point
    const startTime = new Date(`1970-01-01T${data[0].timestamp}`);
    const endTime = new Date(`1970-01-01T${data[data.length - 1].timestamp}`);
    const duration = (endTime.getTime() - startTime.getTime()) / 60000; // Convert to minutes

    return {
      points,
      center,
      startPoint: points[0],
      endPoint: points[points.length - 1],
      totalDistance: totalDistance / 1000, // Convert to km
      duration: duration.toFixed(1),
      maxAltitude: Math.max(...data.map(d => d.gps.altitude))
    };
  }, [data]);

  // Custom icons
  const startIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="flex flex-col items-center">
        <div class="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white shadow-md relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
            <path fill="currentColor" d="M12 2L4.5 20.3L5.2 21L12 18L18.8 21L19.5 20.3L12 2Z" />
          </svg>
        </div>
        <span class="mt-1 text-xs font-semibold text-emerald-700 bg-white px-1 rounded shadow-sm">Start</span>
      </div>
    `,
    iconSize: [40, 40],  // Increased size to accommodate label
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });

  const endIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="flex flex-col items-center">
        <div class="h-6 w-6 rounded-full bg-red-500 border-2 border-white shadow-md relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
            <path fill="currentColor" d="M12 2L4.5 20.3L5.2 21L12 18L18.8 21L19.5 20.3L12 2Z" />
          </svg>
        </div>
        <span class="mt-1 text-xs font-semibold text-red-700 bg-white px-1 rounded shadow-sm">End</span>
      </div>
    `,
    iconSize: [40, 40],  // Increased size to accommodate label
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });


  const pointIcon = L.divIcon({
    className: 'custom-div-icon-point',
    html: `
      <div class="marker-point"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>GPS Flight Track</CardTitle>
        <CardDescription>Flight path and position data</CardDescription>
        <div className="grid grid-cols-4 gap-4 mt-2">
          <div className="space-y-1 bg-muted/30 p-3 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Distance</p>
            <p className="text-2xl font-bold">{flightInfo.totalDistance.toFixed(2)}km</p>
          </div>
          <div className="space-y-1 bg-muted/30 p-3 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold">{flightInfo.duration}min</p>
          </div>
          <div className="space-y-1 bg-muted/30 p-3 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Max Altitude</p>
            <p className="text-2xl font-bold">{flightInfo.maxAltitude.toFixed(1)}m</p>
          </div>
          <div className="space-y-1 bg-muted/30 p-3 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Points</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 px-4 pb-4">
        <div className="h-[650px] w-full rounded-lg border overflow-hidden">
          <MapContainer
            center={flightInfo.center}
            zoom={defaultZoom}
            className="h-full w-full"
            zoomControl={false}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="topright" />
            
            {/* Flight path */}
            <Polyline
              positions={flightInfo.points}
              color="#6366f1"
              weight={3}
              opacity={0.8}
            />

            {/* Start marker */}
            <Marker 
              position={flightInfo.startPoint} 
              icon={startIcon}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-sm mb-2 flex items-center">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                    Take Off Point
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>Time: {data[0].timestamp}</p>
                    <p>Altitude: {data[0].gps.altitude.toFixed(1)}m</p>
                    <p>Lat: {data[0].gps.latitude.toFixed(6)}°</p>
                    <p>Lon: {data[0].gps.longitude.toFixed(6)}°</p>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* End marker */}
            <Marker 
              position={flightInfo.endPoint} 
              icon={endIcon}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-sm mb-2 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Landing Point
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>Time: {data[data.length-1].timestamp}</p>
                    <p>Altitude: {data[data.length-1].gps.altitude.toFixed(1)}m</p>
                    <p>Lat: {data[data.length-1].gps.latitude.toFixed(6)}°</p>
                    <p>Lon: {data[data.length-1].gps.longitude.toFixed(6)}°</p>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Path points */}
            {data.map((point, index) => (
              <Marker
                key={index}
                position={[point.gps.latitude, point.gps.longitude]}
                icon={pointIcon}
                eventHandlers={{
                  click: () => setSelectedPoint(point)
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[200px]">
                    <h3 className="font-bold text-sm mb-2 flex items-center">
                      <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                      Waypoint {index + 1}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>Time: {point.timestamp}</p>
                      <p>Altitude: {point.gps.altitude.toFixed(1)}m</p>
                      <p>Distance: {point.radar.distance.toFixed(1)}m</p>
                      <p>Lat: {point.gps.latitude.toFixed(6)}°</p>
                      <p>Lon: {point.gps.longitude.toFixed(6)}°</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GPSMap;