import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { getMockMLData } from '@/lib/ml-metrics';

interface ScamDetectionMetricsProps {
  timeRange: '24h' | '7d' | '30d';
}

export default function ScamDetectionMetrics({ timeRange }: ScamDetectionMetricsProps) {
  const metrics = useMemo(() => getMockMLData(timeRange), [timeRange]);
  const data = {
    scamsDetected: metrics.scamDetection.scamsDetected,
    fundsProtected: metrics.scamDetection.fundsProtected,
    scamTypeBreakdown: metrics.scamDetection.history,
    weekOverWeek: metrics.scamDetection.weekOverWeek,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Scam Detection Metrics</h3>
        <p className="text-sm text-muted-foreground">
          Monitor detected scams and protected funds
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Scams Detected</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold">{data.scamsDetected}</div>
            <div className="flex items-center text-xs mt-1">
              <ArrowUpIcon className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-500">{data.weekOverWeek.scamsDetected}%</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium">Funds Protected</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold">
              ${Math.floor(data.fundsProtected).toLocaleString()}
            </div>
            <div className="flex items-center text-xs mt-1">
              <ArrowUpIcon className="w-4 h-4 text-emerald-500 mr-1" />
              <span className="text-emerald-500">{data.weekOverWeek.fundsProtected}%</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-4">
        <h4 className="text-sm font-medium mb-4">Scam Type Distribution</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.scamTypeBreakdown}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Honeypot" stackId="a" fill="#ef4444" />
              <Bar dataKey="Rug Pull" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Phishing" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="Price Manipulation" stackId="a" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
