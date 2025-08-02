import { useMemo } from 'react';
import { Card, Badge } from '../ui';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface RecentPredictionsProps {
  timeRange?: '24h' | '7d' | '30d';
}

export default function RecentPredictions({ timeRange }: RecentPredictionsProps) {
  // Mock data - This would come from your API in production
  const predictions = useMemo(() => {
    return [
      {
        id: 1,
        timestamp: '2024-01-20T15:30:00Z',
        fromToken: 'ETH',
        toToken: 'SCAM',
        prediction: 'Scam Detected',
        confidence: 0.98,
        riskFactors: ['Honeypot', 'Unverified Contract'],
        status: 'blocked',
      },
      {
        id: 2,
        timestamp: '2024-01-20T15:25:00Z',
        fromToken: 'USDC',
        toToken: 'WETH',
        prediction: 'Safe',
        confidence: 0.95,
        status: 'allowed',
      },
      {
        id: 3,
        timestamp: '2024-01-20T15:20:00Z',
        fromToken: 'ETH',
        toToken: 'RUG',
        prediction: 'Potential Rug Pull',
        confidence: 0.85,
        riskFactors: ['Low Liquidity', 'Concentrated Holdings'],
        status: 'warning',
      },
      {
        id: 4,
        timestamp: '2024-01-20T15:15:00Z',
        fromToken: 'USDT',
        toToken: 'WBTC',
        prediction: 'Safe',
        confidence: 0.92,
        status: 'allowed',
      },
      {
        id: 5,
        timestamp: '2024-01-20T15:10:00Z',
        fromToken: 'ETH',
        toToken: 'FAKE',
        prediction: 'Scam Detected',
        confidence: 0.96,
        riskFactors: ['Phishing Contract', 'Suspicious Pattern'],
        status: 'blocked',
      },
    ];
  }, []);

  const statusConfig = {
    blocked: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      badge: 'destructive',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      badge: 'warning',
    },
    allowed: {
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      badge: 'success',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Recent Predictions</h3>
        <p className="text-sm text-muted-foreground">
          Latest AI model predictions and their outcomes
        </p>
      </div>

      <div className="space-y-4">
        {predictions.map((prediction) => {
          const status = statusConfig[prediction.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <Card key={prediction.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    <span className="font-medium">
                      {prediction.fromToken} → {prediction.toToken}
                    </span>
                    <Badge variant={prediction.status as any}>
                      {prediction.prediction}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {new Date(prediction.timestamp).toLocaleTimeString()}
                    <span>•</span>
                    <span>Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
                  </div>

                  {prediction.riskFactors && (
                    <div className="flex gap-2 mt-2">
                      {prediction.riskFactors.map((factor, i) => (
                        <Badge key={i} variant="outline">{factor}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
