import React from 'react'

interface ConfidenceGaugeProps {
  value: number // 0..1
  label?: string
}

function getColor(value: number): string {
  if (value >= 0.7) return '#ef4444' // red for deepfake (high prob)
  if (value >= 0.4) return '#f59e0b' // amber medium
  return '#10b981' // green low
}

export default function ConfidenceGauge({ value, label }: ConfidenceGaugeProps) {
  const pct = Math.max(0, Math.min(1, value))
  const size = 120
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = circumference * pct
  const color = getColor(pct)

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
          />
        </g>
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-foreground"
          style={{ fontSize: 18, fontWeight: 700 }}
        >
          {(pct * 100).toFixed(0)}%
        </text>
        {label && (
          <text
            x="50%"
            y={size / 2 + 18}
            dominantBaseline="hanging"
            textAnchor="middle"
            className="fill-muted-foreground"
            style={{ fontSize: 11 }}
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  )
}


