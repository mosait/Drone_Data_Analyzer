// src/features/analysis/views/GPSTrackView.tsx
import { DroneData } from "@/api/types";
import { FlightMap } from "../components/map/FlightMap";
import { AnalysisDataTable } from "../components/table/AnalysisDataTable";

interface GPSTrackViewProps {
  data1: DroneData[];
  data2?: DroneData[];
  fileName1: string;
  fileName2?: string;
}

export function GPSTrackView({
  data1,
  data2,
  fileName1,
  fileName2,
}: GPSTrackViewProps) {
  const hasBothFiles = Boolean(data1 && data2);

  return (
    <div className="space-y-6">
      {/* Map Section */}
      <FlightMap 
        data1={data1}
        data2={data2}
        fileName1={fileName1}
        fileName2={fileName2}
      />

      {/* Tables Section */}
      <div className={hasBothFiles ? "grid grid-cols-2 gap-6" : "w-full"}>
        <div className={hasBothFiles ? "" : "w-full"}>
          <AnalysisDataTable 
            data={data1}
            title={fileName1}
          />
        </div>
        {data2 && fileName2 && (
          <AnalysisDataTable 
            data={data2}
            title={fileName2}
          />
        )}
      </div>
    </div>
  );
}