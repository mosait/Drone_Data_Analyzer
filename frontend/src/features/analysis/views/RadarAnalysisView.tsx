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
  const hasBothFiles = Boolean(data1 && data2);

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className={hasBothFiles ? "grid grid-cols-2 gap-6" : "w-full"}>
        <div className={hasBothFiles ? "" : "w-full"}>
          <SingleRadarChart 
            data={data1}
            fileName={fileName1}
            index={0}
          />
        </div>
        {data2 && fileName2 && (
          <SingleRadarChart 
            data={data2}
            fileName={fileName2}
            index={1}
          />
        )}
      </div>

      {/* Tables Section */}
      <div className={hasBothFiles ? "grid grid-cols-2 gap-6" : "w-full"}>
        <AnalysisDataTable 
          data={data1}
          title={fileName1}
        />
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