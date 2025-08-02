import * as React from "react"
import { cn } from "@/lib/utils"

interface GaugeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  size?: "default" | "large"
  variant?: "healthy" | "warning" | "critical"
}

export function Gauge({
  value,
  size = "default",
  variant = "healthy",
  className,
  ...props
}: GaugeProps) {
  const circumference = 332 // 2 * Math.PI * (53.2) // 53.2 is the radius

  return (
    <div
      className={cn(
        "relative",
        size === "default" ? "h-28 w-28" : "h-36 w-36",
        className
      )}
      {...props}
    >
      {/* Background circle */}
      <svg
        className="absolute inset-0"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="60"
          cy="60"
          r="53.2"
          strokeWidth="13.6"
          className="stroke-muted/25"
          fill="none"
        />
      </svg>

      {/* Foreground circle */}
      <svg
        className="absolute inset-0 -rotate-90 transform"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="60"
          cy="60"
          r="53.2"
          strokeWidth="13.6"
          fill="none"
          className={cn(
            "transition-all duration-300",
            variant === "healthy" && "stroke-emerald-500",
            variant === "warning" && "stroke-yellow-500",
            variant === "critical" && "stroke-red-500",
          )}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (value / 100) * circumference}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "text-2xl font-bold",
          variant === "healthy" && "text-emerald-500",
          variant === "warning" && "text-yellow-500",
          variant === "critical" && "text-red-500",
        )}>
          {value}%
        </span>
      </div>
    </div>
  )
}
