// src/features/analysis/views/RadarAnalysisView.tsx
import { DroneData } from "@/api/types";
import { SingleRadarChart } from "../components/charts/SingleRadarChart";
import { AnalysisDataTable } from "../components/table/AnalysisDataTable";

interface RadarAnalysisViewProps {
  data1: DroneData[];
  data2?: DroneData[];
  fileName1: string;
  fileName2?: string;
}

export function RadarAnalysisView({
  data1,
  data2,
  fileName1,
  fileName2,
}: RadarAnalysisViewProps) {
  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        <SingleRadarChart 
          data={data1}
          fileName={fileName1}
          index={0}
        />
        {data2 ? (
          <SingleRadarChart 
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