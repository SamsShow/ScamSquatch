import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MLHeaderProps {
  timeRange: '24h' | '7d' | '30d';
  onTimeRangeChange: (value: '24h' | '7d' | '30d') => void;
}

export default function MLHeader({ timeRange, onTimeRangeChange }: MLHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">AI Model Performance</h2>
        <p className="text-muted-foreground">
          Monitor ScamSquatch AI model performance, accuracy, and scam detection metrics in real-time.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
