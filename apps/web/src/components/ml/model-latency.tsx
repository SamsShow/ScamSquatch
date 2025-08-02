import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Gauge } from '../ui';
import { getMockMLData } from '@/lib/ml-metrics';

interface ModelLatencyProps {
  timeRange: '24h' | '7d' | '30d';
}

export default function ModelLatency({ timeRange }: ModelLatencyProps) {
  const metrics = useMemo(() => getMockMLData(timeRange), [timeRange]);
  const data = metrics.latency.history;
  const currentLatency = metrics.latency.currentLatency;
  const p95Latency = metrics.latency.p95Latency;
  const latencyHealth = currentLatency < 200 ? 'healthy' : currentLatency < 300 ? 'warning' : 'critical';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Model Latency</h3>
        <p className="text-sm text-muted-foreground">
          Monitor response times and performance bottlenecks
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Latency</h4>
            <div className="flex items-center justify-center py-4">
              <Gauge 
                value={Math.min(100, (currentLatency / 500) * 100)} 
                size="large" 
                variant={latencyHealth} 
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentLatency.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground">Average Response Time</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">P95 Latency</h4>
            <div className="text-2xl font-bold">{p95Latency.toFixed(0)}ms</div>
            <div className="text-xs text-muted-foreground">95th Percentile</div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model Inference</span>
                <span>{(p95Latency * 0.6).toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Processing</span>
                <span>{(p95Latency * 0.3).toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network</span>
                <span>{(p95Latency * 0.1).toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="time" />
            <YAxis domain={[0, 500]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="avgLatency"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.1}
              name="Average Latency"
            />
            <Area
              type="monotone"
              dataKey="p95Latency"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.1}
              name="P95 Latency"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
