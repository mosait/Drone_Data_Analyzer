// src/features/analysis/components/map/FlightMap.tsx
import { useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline, Marker, Popup, ZoomControl } from 'react-leaflet';
import type { DroneData } from "@/api/types";
import { MapControls } from './MapControls';

interface FlightMapProps {
  data1: DroneData[];
  data2?: DroneData[];
  fileName1: string;
  fileName2?: string;
}

export function FlightMap({ 
  data1, 
  data2, 
  fileName1, 
  fileName2 
}: FlightMapProps) {
  const mapRef = useRef<L.Map>(null);
  const defaultZoom = 15;

  // Calculate paths and centers
  const mapData = useMemo(() => {
    const points1 = data1.map(point => [point.gps.latitude, point.gps.longitude] as [number, number]);
    const points2 = data2?.map(point => [point.gps.latitude, point.gps.longitude] as [number, number]);

    const allPoints = [...points1, ...(points2 || [])];
    const center = allPoints.reduce(
      (acc, [lat, lng]) => [acc[0] + lat / allPoints.length, acc[1] + lng / allPoints.length],
      [0, 0]
    ) as [number, number];

    return {
      path1: points1,
      path2: points2,
      center,
      start1: points1[0],
      end1: points1[points1.length - 1],
      start2: points2?.[0],
      end2: points2?.[points2.length - 1],
    };
  }, [data1, data2]);

  // Custom icons
  const startIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center">
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2L4.5 20.3L5.2 21L12 18L18.8 21L19.5 20.3L12 2Z" />
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  const endIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="h-6 w-6 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center">
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2L4.5 20.3L5.2 21L12 18L18.8 21L19.5 20.3L12 2Z" />
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  const createPointIcon = (color: string) => L.divIcon({
    className: 'custom-div-icon-point',
    html: `<div class="marker-point" style="background-color: ${color};"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -5],
  });

  const fitBounds = (points: [number, number][]) => {
    if (mapRef.current && points.length > 0) {
      const bounds = L.latLngBounds(points);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const centerOnPath1 = () => {
    fitBounds(mapData.path1);
  };

  const centerOnPath2 = () => {
    if (mapData.path2) {
      fitBounds(mapData.path2);
    }
  };

  const fitAllPaths = () => {
    if (mapRef.current) {
      const allPoints = [...mapData.path1, ...(mapData.path2 || [])];
      fitBounds(allPoints);
    }
  };

  const pointIcon1 = createPointIcon('#A855F7'); // Purple for first path
  const pointIcon2 = createPointIcon('#F97316'); // Orange for second path

  return (
    <Card>
      <CardHeader>
        <CardTitle>GPS Flight Track</CardTitle>
      </CardHeader>
      <CardContent className="h-[800px]">
        <div className="h-full w-full rounded-lg border overflow-hidden">
          <MapContainer
            center={mapData.center}
            zoom={defaultZoom}
            ref={mapRef}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="topright" />
            
            {/* First flight path */}
            <Polyline
              positions={mapData.path1}
              color="#A855F7"
              weight={3}
              opacity={0.8}
            />
            <Marker position={mapData.start1} icon={startIcon}>
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-sm mb-2 flex items-center">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                    {fileName1} Start
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>Time: {data1[0].timestamp}</p>
                    <p>Altitude: {data1[0].gps.altitude.toFixed(1)}m</p>
                    <p>Distance: {data1[0].radar.distance.toFixed(1)}m</p>
                    <p>Lat: {data1[0].gps.latitude.toFixed(6)}°</p>
                    <p>Lon: {data1[0].gps.longitude.toFixed(6)}°</p>
                  </div>
                </div>
              </Popup>
            </Marker>

            {data1.map((point, idx) => (
              <Marker
                key={`p1-${idx}`}
                position={[point.gps.latitude, point.gps.longitude]}
                icon={pointIcon1}
              >
                <Popup>
                  <div className="p-3 min-w-[200px]">
                    <h3 className="font-bold text-sm mb-2 flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#A855F7' }}></span>
                      {fileName1} Point {idx + 1}
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

            <Marker position={mapData.end1} icon={endIcon}>
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-sm mb-2 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    {fileName1} End
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>Time: {data1[data1.length - 1].timestamp}</p>
                    <p>Altitude: {data1[data1.length - 1].gps.altitude.toFixed(1)}m</p>
                    <p>Distance: {data1[data1.length - 1].radar.distance.toFixed(1)}m</p>
                    <p>Lat: {data1[data1.length - 1].gps.latitude.toFixed(6)}°</p>
                    <p>Lon: {data1[data1.length - 1].gps.longitude.toFixed(6)}°</p>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Second flight path if available */}
            {mapData.path2 && data2 && (
              <>
                <Polyline
                  positions={mapData.path2}
                  color="#F97316"
                  weight={3}
                  opacity={0.8}
                />
                <Marker position={mapData.start2!} icon={startIcon}>
                  <Popup>
                    <div className="p-3 min-w-[200px]">
                      <h3 className="font-bold text-sm mb-2 flex items-center">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                        {fileName2} Start
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p>Time: {data2[0].timestamp}</p>
                        <p>Altitude: {data2[0].gps.altitude.toFixed(1)}m</p>
                        <p>Distance: {data2[0].radar.distance.toFixed(1)}m</p>
                        <p>Lat: {data2[0].gps.latitude.toFixed(6)}°</p>
                        <p>Lon: {data2[0].gps.longitude.toFixed(6)}°</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {data2.map((point, idx) => (
                  <Marker
                    key={`p2-${idx}`}
                    position={[point.gps.latitude, point.gps.longitude]}
                    icon={pointIcon2}
                  >
                    <Popup>
                      <div className="p-3 min-w-[200px]">
                        <h3 className="font-bold text-sm mb-2 flex items-center">
                          <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#F97316' }}></span>
                          {fileName2} Point {idx + 1}
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

                <Marker position={mapData.end2!} icon={endIcon}>
                  <Popup>
                    <div className="p-3 min-w-[200px]">
                      <h3 className="font-bold text-sm mb-2 flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        {fileName2} End
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p>Time: {data2[data2.length - 1].timestamp}</p>
                        <p>Altitude: {data2[data2.length - 1].gps.altitude.toFixed(1)}m</p>
                        <p>Distance: {data2[data2.length - 1].radar.distance.toFixed(1)}m</p>
                        <p>Lat: {data2[data2.length - 1].gps.latitude.toFixed(6)}°</p>
                        <p>Lon: {data2[data2.length - 1].gps.longitude.toFixed(6)}°</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>
          <MapControls 
            onCenterPath1={centerOnPath1}
            onCenterPath2={mapData.path2 ? centerOnPath2 : undefined}
            onFitAll={fitAllPaths}
            map={mapRef.current}
            fileName1={fileName1}
            fileName2={fileName2}
          />
        </div>
      </CardContent>
    </Card>
  );
}