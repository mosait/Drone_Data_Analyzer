// CombinedAltitudeChart.tsx
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
  data1: DroneData[];
  data2?: DroneData[];
  fileName1: string;
  fileName2?: string;
  syncHover?: {
    activeTooltipIndex: number | null;
    syncState: ChartSyncState;
    onHover: (state: ChartSyncState | null) => void;
  };
}

const CustomTooltip = ({ active, payload, label, index }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-1">Data Point: {index ?? label}</p>
      {payload.map((entry: any, idx: number) => {
        if (!entry || entry.value === undefined) return null;
        return (
          <p 
            key={idx} 
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

export function CombinedAltitudeChart({ 
  data1 = [], 
  data2 = [], 
  fileName1, 
  fileName2,
  syncHover 
}: CombinedChartProps) {
  const chartData = useMemo(() => {
    if (!data1.length && !data2.length) {
      return {
        data: [],
        averages: { avg1: undefined, avg2: undefined },
        maxLength: 0
      };
    }

    const maxLength = Math.max(data1.length, data2.length);
    const combinedData = Array.from({ length: maxLength }, (_, i) => ({
      time: i,
      altitude1: data1[i]?.gps?.altitude,
      altitude2: data2[i]?.gps?.altitude
    }));

    const avg1 = data1.length > 0
      ? data1.reduce((sum, d) => sum + (d.gps?.altitude || 0), 0) / data1.length
      : undefined;
    
    const avg2 = data2.length > 0
      ? data2.reduce((sum, d) => sum + (d.gps?.altitude || 0), 0) / data2.length
      : undefined;

    return {
      data: combinedData,
      averages: { avg1, avg2 },
      maxLength
    };
  }, [data1, data2]);

  if (chartData.maxLength === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Altitude Comparison</CardTitle>
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
        <CardTitle>Altitude Comparison</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData.data}
            margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            onMouseMove={(state: any) => {
              if (syncHover && state?.activeTooltipIndex !== undefined) {
                syncHover.onHover({
                  activeIndex: state.activeTooltipIndex,
                  mouseX: state.chartX ?? 0,
                  mouseY: state.chartY ?? 0,
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
              <linearGradient id="colorAlt1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAlt2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
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
                value: 'Altitude (m)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip 
              content={(props) => (
                <CustomTooltip 
                  {...props} 
                  index={syncHover?.activeTooltipIndex ?? null}
                />
              )}
              cursor={{
                stroke: '#666',
                strokeWidth: 1,
                strokeDasharray: '3 3'
              }}
              active={Boolean(syncHover?.activeTooltipIndex !== null)}
              position={{
                x: syncHover?.syncState.mouseX ?? undefined,
                y: syncHover?.syncState.mouseY ?? undefined
              }}
              coordinate={
                typeof syncHover?.activeTooltipIndex === 'number' 
                  ? { x: syncHover.activeTooltipIndex }
                  : undefined
              }
            />
            <Legend 
              verticalAlign="top"
              height={36}
            />

            {/* First file data */}
            {data1.length > 0 && (
              <>
                <Area
                  type="monotone"
                  dataKey="altitude1"
                  name={`${fileName1} Altitude`}
                  stroke="#A855F7"
                  fillOpacity={1}
                  fill="url(#colorAlt1)"
                  isAnimationActive={false}
                  strokeWidth={2}
                  activeDot={{ 
                    r: 4,
                    strokeWidth: 2,
                    fill: "#A855F7",
                    stroke: "#fff"
                  }}
                />
                {chartData.averages.avg1 !== undefined && (
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

            {/* Second file data if available */}
            {data2.length > 0 && (
              <>
                <Area
                  type="monotone"
                  dataKey="altitude2"
                  name={`${fileName2} Altitude`}
                  stroke="#F97316"
                  fillOpacity={1}
                  fill="url(#colorAlt2)"
                  isAnimationActive={false}
                  strokeWidth={2}
                  activeDot={{ 
                    r: 4,
                    strokeWidth: 2,
                    fill: "#F97316",
                    stroke: "#fff"
                  }}
                />
                {chartData.averages.avg2 !== undefined && (
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