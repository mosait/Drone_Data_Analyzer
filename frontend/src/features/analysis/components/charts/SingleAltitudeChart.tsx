// src/features/analysis/components/charts/SingleAltitudeChart.tsx
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

interface SingleChartProps {
  data: DroneData[];
  fileName: string;
  index?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-1">Time: {label}min</p>
      {payload.map((entry: any, index: number) => (
        <p 
          key={index} 
          className="text-sm" 
          style={{ color: entry.stroke }}
        >
          {entry.name}: {entry.value.toFixed(1)}m
        </p>
      ))}
    </div>
  );
};

export function SingleAltitudeChart({ 
  data, 
  fileName, 
  index = 0 
}: SingleChartProps) {
  const chartData = useMemo(() => {
    const processedData = data.map((item, idx) => ({
      time: idx,
      altitude: item.gps.altitude,
    }));

    const avg = data.reduce((sum, d) => sum + d.gps.altitude, 0) / data.length;

    return {
      data: processedData,
      average: avg
    };
  }, [data]);

  const color = index === 0 ? "#A855F7" : "#F97316"; // Purple for first, Orange for second

  return (
    <Card>
      <CardHeader>
        <CardTitle>Altitude - {fileName}</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData.data}
            margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id={`colorAlt${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time"
              type="number"
              domain={[0, data.length - 1]}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              label={{ 
                value: 'Time (min)', 
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
              content={CustomTooltip}
              cursor={{ stroke: '#666', strokeWidth: 1 }}
            />
            <Legend verticalAlign="top" height={36} />

            <Area
              type="monotone"
              dataKey="altitude"
              name="Altitude"
              stroke={color}
              fillOpacity={1}
              fill={`url(#colorAlt${index})`}
              isAnimationActive={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey={() => chartData.average}
              name="Average"
              stroke={color}
              strokeDasharray="5 5"
              isAnimationActive={false}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}