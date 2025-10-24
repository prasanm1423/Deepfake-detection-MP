import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface EnhancedCardProps {
  title: string
  subtitle?: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
    period: string
  }
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'stable'
  status?: 'success' | 'warning' | 'danger' | 'info'
  className?: string
  children?: React.ReactNode
}

export function EnhancedCard({
  title,
  subtitle,
  value,
  change,
  icon,
  trend,
  status,
  className,
  children
}: EnhancedCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
      case 'warning': return 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20'
      case 'danger': return 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'
      case 'info': return 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'
      default: return 'border-border/20'
    }
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      case 'stable': return '→'
      default: return null
    }
  }

  return (
    <Card className={cn(
      'glass-effect transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
      getStatusColor(status),
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <Badge variant="outline" className="text-xs">
              {getTrendIcon(trend)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground">
              {value}
            </span>
            {change && (
              <div className="flex items-center space-x-1">
                <span className={cn(
                  'text-xs font-medium',
                  change.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {change.isPositive ? '+' : ''}{change.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {change.period}
                </span>
              </div>
            )}
          </div>
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

interface AnalysisCardProps {
  result: any
  index: number
  onExpand: (index: number) => void
  isExpanded: boolean
}

export function AnalysisCard({ result, index, onExpand, isExpanded }: AnalysisCardProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
      case 'HIGH': return 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20'
      case 'LOW': return 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
      default: return 'border-border/20'
    }
  }

  return (
    <Card className={cn(
      'glass-effect transition-all duration-300 hover:shadow-lg',
      getRiskColor(result.riskLevel || 'LOW')
    )}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'w-3 h-3 rounded-full',
                result.isDeepfake ? 'bg-red-500' : 'bg-green-500'
              )} />
              <div>
                <h3 className="font-semibold text-foreground capitalize">
                  {result.type} Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  {result.isDeepfake ? 'Potential deepfake detected' : 'Appears authentic'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge
                variant={result.isDeepfake ? 'destructive' : 'default'}
                className={result.isDeepfake ? '' : 'bg-green-500 text-white'}
              >
                {result.isDeepfake ? 'DEEPFAKE' : 'AUTHENTIC'}
              </Badge>
              {result.riskLevel && (
                <Badge variant="outline" className="text-xs">
                  {result.riskLevel} RISK
                </Badge>
              )}
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={result.confidence * 100} 
              className="h-2"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => onExpand(index)}
              className="flex-1 text-xs py-2 px-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </button>
            <button className="text-xs py-2 px-3 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors">
              Export
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}