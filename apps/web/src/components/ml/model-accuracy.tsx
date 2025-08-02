import { useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { Progress } from '../ui/progress';
import { getMockMLData } from '@/lib/ml-metrics';

interface ModelAccuracyProps {
  timeRange: '24h' | '7d' | '30d';
}

export default function ModelAccuracy({ timeRange }: ModelAccuracyProps) {
  const metrics = useMemo(() => getMockMLData(timeRange), [timeRange]);
  const data = {
    accuracy: metrics.accuracy.overall,
    predictions: metrics.accuracy.totalPredictions,
    breakdown: metrics.accuracy.breakdown,
  };
  const confidenceScores = metrics.accuracy.confidenceDistribution;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Model Accuracy</h3>
        <p className="text-sm text-muted-foreground">
          Track prediction accuracy and confidence levels
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Overall Accuracy</h4>
              <div className="text-3xl font-bold text-brand">
                {(data.accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Based on {data.predictions.toLocaleString()} predictions
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-medium mb-4">Confidence Distribution</h4>
            <div className="space-y-3">
              {confidenceScores.map((score) => (
                <div key={score.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{score.label}</span>
                    <span>{score.value}%</span>
                  </div>
                  <Progress value={score.value} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Prediction Breakdown</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.breakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {data.breakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
