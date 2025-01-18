// src/features/analysis/views/AltitudeAnalysisView.tsx
import { DroneData } from "@/api/types";
import { SingleAltitudeChart } from "../components/charts/SingleAltitudeChart";
import { AnalysisDataTable } from "../components/table/AnalysisDataTable";

interface AltitudeAnalysisViewProps {
  data1: DroneData[];
  data2?: DroneData[];
  fileName1: string;
  fileName2?: string;
}

export function AltitudeAnalysisView({
  data1,
  data2,
  fileName1,
  fileName2,
}: AltitudeAnalysisViewProps) {
  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        <SingleAltitudeChart 
          data={data1}
          fileName={fileName1}
          index={0}
        />
        {data2 ? (
          <SingleAltitudeChart 
            data={data2}
            fileName={fileName2 || ""}
            index={1}
          />
        ) : (
          // Empty div to maintain grid layout when no second file
          <div />
        )}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-2 gap-6">
        <AnalysisDataTable 
          data={data1}
          title={fileName1}
        />
        {data2 && (
          <AnalysisDataTable 
            data={data2}
            title={fileName2 || ""}
          />
        )}
      </div>
    </div>
  );
}