// src/features/analysis/components/map/MapControls.tsx
import { Button } from "@/components/ui/button";
import { MapPin, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import L from "leaflet";

interface MapControlsProps {
  onCenterPath1: () => void;
  onCenterPath2?: () => void;
  onFitAll: () => void;
  map: L.Map | null;
  fileName1: string;
  fileName2?: string;
}

export function MapControls({
  onCenterPath1,
  onCenterPath2,
  onFitAll,
  map,
  fileName1,
  fileName2
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg shadow-lg">
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCenterPath1}
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {fileName1}
          </Button>
          
          {fileName2 && onCenterPath2 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCenterPath2}
              className="w-full"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {fileName2}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onFitAll}
            className="w-full"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Fit All
          </Button>
        </div>
      </div>

      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-lg shadow-lg">
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => map?.zoomIn()}
            className="w-full"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => map?.zoomOut()}
            className="w-full"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}