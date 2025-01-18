// src/features/analysis/components/map/FlightMap.tsx
import { useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Polyline, Marker, Popup, ZoomControl } from 'react-leaflet';
import type { DroneData } from "@/api/types";

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
  
      // Calculate center considering both paths if available
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
  

  // Custom markers
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
  });

  const centerOnPath = (points: [number, number][] | undefined) => {
    if (mapRef.current && points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      mapRef.current.fitBounds(bounds);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>GPS Flight Track</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => centerOnPath(mapData.path1)}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Center on {fileName1}
            </Button>
            {mapData.path2 && fileName2 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => centerOnPath(mapData.path2)}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Center on {fileName2}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full rounded-lg border overflow-hidden">
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
              color="#ff7300"
              weight={3}
              opacity={0.8}
            />
            <Marker position={mapData.start1} icon={startIcon}>
              <Popup>
                <strong>{fileName1} Start</strong>
                <br />
                Time: {data1[0].timestamp}
              </Popup>
            </Marker>
            <Marker position={mapData.end1} icon={endIcon}>
              <Popup>
                <strong>{fileName1} End</strong>
                <br />
                Time: {data1[data1.length - 1].timestamp}
              </Popup>
            </Marker>

            {/* Second flight path if available */}
            {mapData.path2 && (
              <>
                <Polyline
                  positions={mapData.path2}
                  color="#0088fe"
                  weight={3}
                  opacity={0.8}
                />
                {mapData.start2 && (
                  <Marker position={mapData.start2} icon={startIcon}>
                    <Popup>
                      <strong>{fileName2} Start</strong>
                      <br />
                      Time: {data2![0].timestamp}
                    </Popup>
                  </Marker>
                )}
                {mapData.end2 && (
                  <Marker position={mapData.end2} icon={endIcon}>
                    <Popup>
                      <strong>{fileName2} End</strong>
                      <br />
                      Time: {data2![data2!.length - 1].timestamp}
                    </Popup>
                  </Marker>
                )}
              </>
            )}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}