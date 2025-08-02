export interface MLModelMetrics {
  performance: {
    f1Score: number;
    precision: number;
    recall: number;
    history: Array<{
      time: string;
      f1Score: number;
      precision: number;
      recall: number;
    }>;
  };
  latency: {
    currentLatency: number;
    p95Latency: number;
    history: Array<{
      time: string;
      avgLatency: number;
      p95Latency: number;
    }>;
  };
  accuracy: {
    overall: number;
    totalPredictions: number;
    breakdown: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    confidenceDistribution: Array<{
      label: string;
      value: number;
    }>;
  };
  scamDetection: {
    scamsDetected: number;
    fundsProtected: number;
    weekOverWeek: {
      scamsDetected: number;
      fundsProtected: number;
    };
    history: Array<{
      time: string;
      honeypot: number;
      rugPull: number;
      phishing: number;
      priceManipulation: number;
    }>;
  };
}

export function getMockMLData(timeRange: '24h' | '7d' | '30d'): MLModelMetrics {
  const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
  
  // Generate performance history
  const performanceHistory = Array.from({ length: points }, (_, i) => ({
    time: timeRange === '24h' ? `${i}h` : `Day ${i + 1}`,
    f1Score: 0.85 + Math.random() * 0.1,
    precision: 0.88 + Math.random() * 0.08,
    recall: 0.82 + Math.random() * 0.12,
  }));

  // Generate latency history
  const latencyHistory = Array.from({ length: points }, (_, i) => ({
    time: timeRange === '24h' ? `${i}h` : `Day ${i + 1}`,
    avgLatency: 150 + Math.random() * 100,
    p95Latency: 250 + Math.random() * 150,
  }));

  // Generate scam detection history
  const scamHistory = Array.from({ length: points }, (_, i) => ({
    time: timeRange === '24h' ? `${i}h` : `Day ${i + 1}`,
    honeypot: Math.floor(Math.random() * 10),
    rugPull: Math.floor(Math.random() * 8),
    phishing: Math.floor(Math.random() * 6),
    priceManipulation: Math.floor(Math.random() * 5),
  }));

  return {
    performance: {
      f1Score: performanceHistory[performanceHistory.length - 1].f1Score,
      precision: performanceHistory[performanceHistory.length - 1].precision,
      recall: performanceHistory[performanceHistory.length - 1].recall,
      history: performanceHistory,
    },
    latency: {
      currentLatency: latencyHistory[latencyHistory.length - 1].avgLatency,
      p95Latency: latencyHistory[latencyHistory.length - 1].p95Latency,
      history: latencyHistory,
    },
    accuracy: {
      overall: 0.92 + Math.random() * 0.05,
      totalPredictions: 1000,
      breakdown: [
        { name: 'True Positive', value: 450, color: '#10b981' },
        { name: 'True Negative', value: 470, color: '#0ea5e9' },
        { name: 'False Positive', value: 40, color: '#f59e0b' },
        { name: 'False Negative', value: 40, color: '#ef4444' },
      ],
      confidenceDistribution: [
        { label: 'Very High (>90%)', value: 65 },
        { label: 'High (70-90%)', value: 25 },
        { label: 'Medium (50-70%)', value: 8 },
        { label: 'Low (<50%)', value: 2 },
      ],
    },
    scamDetection: {
      scamsDetected: 156 + Math.floor(Math.random() * 20),
      fundsProtected: 125000 + Math.random() * 25000,
      weekOverWeek: {
        scamsDetected: 12.5,
        fundsProtected: 8.3,
      },
      history: scamHistory,
    },
  };
}
