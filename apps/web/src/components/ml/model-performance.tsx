import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { getMockMLData } from '@/lib/ml-metrics';

interface ModelPerformanceProps {
  timeRange: '24h' | '7d' | '30d';
}

export default function ModelPerformance({ timeRange }: ModelPerformanceProps) {
  const metrics = useMemo(() => getMockMLData(timeRange), [timeRange]);
  const data = metrics.performance.history;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Model Performance</h3>
        <p className="text-sm text-muted-foreground">
          Track key performance metrics including F1 Score, Precision, and Recall
        </p>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis domain={[0.7, 1]} />
            <Tooltip />
            <Line type="monotone" dataKey="f1Score" stroke="#0ea5e9" name="F1 Score" />
            <Line type="monotone" dataKey="precision" stroke="#10b981" name="Precision" />
            <Line type="monotone" dataKey="recall" stroke="#8b5cf6" name="Recall" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">F1 Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-sky-500">
              {(metrics.performance.f1Score * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Precision</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-500">
              {(metrics.performance.precision * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Recall</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-purple-500">
              {(metrics.performance.recall * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
