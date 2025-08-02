'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import MLHeader from '@/components/ml/header';
import ModelPerformance from '@/components/ml/model-performance';
import ModelLatency from '@/components/ml/model-latency';
import ModelAccuracy from '@/components/ml/model-accuracy';
import ScamDetectionMetrics from '@/components/ml/scam-detection-metrics';
import RecentPredictions from '@/components/ml/recent-predictions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function MLOperationsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-brand-light bg-clip-text text-transparent">
            ML Operations
          </h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* ML Overview Section */}
        <MLHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Performance Overview */}
          <Card className="p-6 bg-card border-border">
            <ModelPerformance timeRange={timeRange} />
          </Card>

          {/* Model Latency */}
          <Card className="p-6 bg-card border-border">
            <ModelLatency timeRange={timeRange} />
          </Card>

          {/* Model Accuracy */}
          <Card className="p-6 bg-card border-border">
            <ModelAccuracy timeRange={timeRange} />
          </Card>

          {/* Scam Detection Metrics */}
          <Card className="p-6 bg-card border-border">
            <ScamDetectionMetrics timeRange={timeRange} />
          </Card>
        </div>

        {/* Recent Predictions */}
        <div className="mt-8">
          <Card className="p-6 bg-card border-border">
            <RecentPredictions />
          </Card>
        </div>
      </main>
    </div>
  );
}
