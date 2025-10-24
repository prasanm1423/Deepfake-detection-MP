import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ConfidenceChartProps {
  confidence: number
  isDeepfake: boolean
  className?: string
}

export function ConfidenceChart({ confidence, isDeepfake, className }: ConfidenceChartProps) {
  const getColor = (confidence: number, isDeepfake: boolean) => {
    if (isDeepfake) {
      if (confidence >= 0.8) return 'text-red-500'
      if (confidence >= 0.6) return 'text-orange-500'
      return 'text-yellow-500'
    } else {
      if (confidence >= 0.8) return 'text-green-500'
      if (confidence >= 0.6) return 'text-blue-500'
      return 'text-gray-500'
    }
  }

  const getBarColor = (confidence: number, isDeepfake: boolean) => {
    if (isDeepfake) {
      if (confidence >= 0.8) return 'bg-red-500'
      if (confidence >= 0.6) return 'bg-orange-500'
      return 'bg-yellow-500'
    } else {
      if (confidence >= 0.8) return 'bg-green-500'
      if (confidence >= 0.6) return 'bg-blue-500'
      return 'bg-gray-500'
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <div className={cn('text-3xl font-bold', getColor(confidence, isDeepfake))}>
          {(confidence * 100).toFixed(1)}%
        </div>
        <div className="text-sm text-muted-foreground">
          {isDeepfake ? 'Deepfake Probability' : 'Authenticity Confidence'}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <div className="w-full bg-secondary/20 rounded-full h-3">
          <div 
            className={cn(
              'h-3 rounded-full transition-all duration-500 ease-out',
              getBarColor(confidence, isDeepfake)
            )}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

interface RiskIndicatorProps {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  confidence: number
  className?: string
}

export function RiskIndicator({ riskLevel, confidence, className }: RiskIndicatorProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-black'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '🚨'
      case 'HIGH': return '⚠️'
      case 'MEDIUM': return '⚡'
      case 'LOW': return '✅'
      default: return '❓'
    }
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="text-lg">{getRiskIcon(riskLevel)}</span>
      <Badge className={getRiskColor(riskLevel)}>
        {riskLevel} RISK
      </Badge>
      <span className="text-sm text-muted-foreground">
        {(confidence * 100).toFixed(1)}% confidence
      </span>
    </div>
  )
}

interface AnalysisMetricsProps {
  results: any[]
  className?: string
}

export function AnalysisMetrics({ results, className }: AnalysisMetricsProps) {
  const totalAnalyses = results.length
  const deepfakeCount = results.filter(r => r.isDeepfake).length
  const authenticCount = results.filter(r => !r.isDeepfake).length
  const avgConfidence = results.length > 0 
    ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length 
    : 0

  const metrics = [
    {
      label: 'Total Analyses',
      value: totalAnalyses,
      icon: '📊',
      color: 'text-blue-500'
    },
    {
      label: 'Authentic',
      value: authenticCount,
      icon: '✅',
      color: 'text-green-500'
    },
    {
      label: 'Deepfakes',
      value: deepfakeCount,
      icon: '🚨',
      color: 'text-red-500'
    },
    {
      label: 'Avg. Confidence',
      value: `${(avgConfidence * 100).toFixed(1)}%`,
      icon: '🎯',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {metrics.map((metric, index) => (
        <Card key={index} className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{metric.icon}</span>
              <div>
                <div className={cn('text-lg font-bold', metric.color)}>
                  {metric.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.label}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface TrendChartProps {
  data: { date: string; value: number }[]
  className?: string
}

export function TrendChart({ data, className }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className={cn('glass-effect', className)}>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">No trend data available</div>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue

  return (
    <Card className={cn('glass-effect', className)}>
      <CardHeader>
        <CardTitle className="text-sm">Analysis Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-end space-x-1">
          {data.map((point, index) => {
            const height = range > 0 ? ((point.value - minValue) / range) * 100 : 50
            return (
              <div
                key={index}
                className="flex-1 bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                style={{ height: `${height}%` }}
                title={`${point.date}: ${point.value}`}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </CardContent>
    </Card>
  )
}
