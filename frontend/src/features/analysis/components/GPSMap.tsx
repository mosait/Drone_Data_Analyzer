// src/features/analysis/components/GPSMap.tsx
import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline, Marker, Popup, ZoomControl } from 'react-leaflet';
import type { DroneData } from "@/api/types"

interface GPSMapProps {
  data: DroneData[];
  fileId?: string;
}

const GPSMap = ({ data, fileId = '1' }: GPSMapProps) => {
  const [selectedPoint, setSelectedPoint] = useState<DroneData | null>(null);

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

    // Calculate duration
    const duration = (new Date(data[data.length - 1].timestamp).getTime() - 
                     new Date(data[0].timestamp).getTime()) / 1000; // in seconds

    return {
      points,
      center,
      startPoint: points[0],
      endPoint: points[points.length - 1],
      totalDistance: totalDistance / 1000, // Convert to km
      duration: duration / 60, // Convert to minutes
      maxAltitude: Math.max(...data.map(d => d.gps.altitude))
    };
  }, [data]);

  // Custom start icon
  const startIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        position: relative;
        background-color: #22c55e;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M12 2L4.5 20.3L5.2 21L12 18L18.8 21L19.5 20.3L12 2Z"/></svg>') center/contain no-repeat;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  // Custom end icon
  const endIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        position: relative;
        background-color: #ef4444;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M12 2L4.5 20.3L5.2 21L12 18L18.8 21L19.5 20.3L12 2Z"/></svg>') center/contain no-repeat;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  // Custom point icon with larger hit area
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
            <p className="text-2xl font-bold">{flightInfo.duration.toFixed(1)}min</p>
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
            zoom={13}
            className="h-full w-full"
            zoomControl={false}
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
                    <p>Time: {new Date(data[0].timestamp).toLocaleTimeString()}</p>
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
                    <p>Time: {new Date(data[data.length-1].timestamp).toLocaleTimeString()}</p>
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
                      <p>Time: {new Date(point.timestamp).toLocaleTimeString()}</p>
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