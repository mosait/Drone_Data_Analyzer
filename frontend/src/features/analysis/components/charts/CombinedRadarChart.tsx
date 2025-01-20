// src/features/analysis/components/charts/CombinedRadarChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ComposedChart,
  Area,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useMemo } from 'react';
import { DroneData } from "@/api/types";

interface ChartSyncState {
  activeIndex: number | null;
  mouseX: number;
  mouseY: number;
}

interface CombinedChartProps {
  data1?: DroneData[]; // Optional with default fallback
  data2?: DroneData[]; // Optional with default fallback
  fileName1: string;
  fileName2?: string;
  syncHover?: {
    activeTooltipIndex: number | null;
    syncState: ChartSyncState;
    onHover: (state: ChartSyncState | null) => void;
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  
  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-1">Data Point: {label}</p>
      {payload.map((entry: any, index: number) => {
        if (!entry || entry.value === undefined) return null;
        return (
          <p 
            key={index} 
            className="text-sm" 
            style={{ color: entry.stroke }}
          >
            {entry.name}: {entry.value.toFixed(1)}m
          </p>
        );
      })}
    </div>
  );
};

export function CombinedRadarChart({ 
  data1 = [], 
  data2 = [], 
  fileName1, 
  fileName2,
  syncHover 
}: CombinedChartProps) {
  const chartData = useMemo(() => {
    // Calculate maximum length between datasets
    const maxLength = Math.max(data1.length, data2.length);
    const combinedData = Array.from({ length: maxLength }, (_, i) => ({
      time: i,
      distance1: data1[i]?.radar?.distance ?? null, // Safely handle undefined radar data
      distance2: data2[i]?.radar?.distance ?? null,
    }));

    // Calculate averages if data exists
    const avg1 = data1.length > 0
      ? data1.reduce((sum, d) => sum + (d.radar?.distance ?? 0), 0) / data1.length
      : null;

    const avg2 = data2.length > 0
      ? data2.reduce((sum, d) => sum + (d.radar?.distance ?? 0), 0) / data2.length
      : null;

    return {
      data: combinedData,
      averages: { avg1, avg2 },
      maxLength,
    };
  }, [data1, data2]);

  // If no data is available, render an empty state
  if (chartData.maxLength === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Radar Distance Comparison</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Radar Distance Comparison</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData.data}
            margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            onMouseMove={(state: any) => {
              if (syncHover && 
                  typeof state?.activeTooltipIndex === 'number' &&
                  typeof state?.chartX === 'number' &&
                  typeof state?.chartY === 'number') {
                syncHover.onHover({
                  activeIndex: state.activeTooltipIndex,
                  mouseX: state.chartX,
                  mouseY: state.chartY
                });
              }
            }}
            onMouseLeave={() => {
              if (syncHover) {
                syncHover.onHover(null);
              }
            }}
          >
            <defs>
              <linearGradient id="colorDist1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorDist2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time"
              type="number"
              domain={[0, chartData.maxLength - 1]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{ 
                value: 'Data Point', 
                position: 'bottom',
                offset: 0,
                style: { fontSize: 12 }
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{ 
                value: 'Distance (m)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip 
              content={CustomTooltip}
              cursor={{ stroke: '#666', strokeWidth: 1 }}
              active={syncHover?.activeTooltipIndex !== null}
            />
            <Legend verticalAlign="top" height={36} />

            {/* First file data */}
            {data1.length > 0 && (
              <>
                <Area
                  type="monotone"
                  dataKey="distance1"
                  name={`${fileName1} Distance`}
                  stroke="#A855F7"
                  fillOpacity={1}
                  fill="url(#colorDist1)"
                  isAnimationActive={false}
                  strokeWidth={2}
                />
                {chartData.averages.avg1 !== null && (
                  <Line
                    type="monotone"
                    dataKey={() => chartData.averages.avg1}
                    name={`${fileName1} Average`}
                    stroke="#A855F7"
                    strokeDasharray="5 5"
                    isAnimationActive={false}
                    dot={false}
                  />
                )}
              </>
            )}

            {/* Second file data */}
            {data2.length > 0 && (
              <>
                <Area
                  type="monotone"
                  dataKey="distance2"
                  name={`${fileName2} Distance`}
                  stroke="#F97316"
                  fillOpacity={1}
                  fill="url(#colorDist2)"
                  isAnimationActive={false}
                  strokeWidth={2}
                />
                {chartData.averages.avg2 !== null && (
                  <Line
                    type="monotone"
                    dataKey={() => chartData.averages.avg2}
                    name={`${fileName2} Average`}
                    stroke="#F97316"
                    strokeDasharray="5 5"
                    isAnimationActive={false}
                    dot={false}
                  />
                )}
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}