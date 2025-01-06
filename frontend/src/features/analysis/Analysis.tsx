// src/features/analysis/Analysis.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockFlightData } from '../../utils/mockData';
import GPSMap from './components/GPSMap';

const AnalysisView = () => {
  const formatChartData = mockFlightData.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    altitude: d.altitude,
    distance: d.radar.distance,
  }));

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="grid grid-cols-1 gap-6">
        {/* Radar Distance Data */}
        <Card>
          <CardHeader>
            <CardTitle>Radar Distance</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  label={{ 
                    value: 'Distance (m)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="distance" 
                  stroke="#8884d8" 
                  dot={false}
                  name="Distance"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Altitude Data */}
        <Card>
          <CardHeader>
            <CardTitle>Altitude</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  label={{ 
                    value: 'Altitude (m)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="altitude" 
                  stroke="#ff7300" 
                  dot={false}
                  name="Altitude"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GPS Map */}
        <Card>
          <CardHeader>
            <CardTitle>GPS Track</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] relative">
            <GPSMap data={mockFlightData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisView;