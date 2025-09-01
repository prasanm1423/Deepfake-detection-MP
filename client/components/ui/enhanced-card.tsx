import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'

// Enhanced card with better visual hierarchy
interface EnhancedCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  hover?: boolean
  interactive?: boolean
  onClick?: () => void
}

export function EnhancedCard({ 
  children, 
  className, 
  variant = 'default',
  hover = false,
  interactive = false,
  onClick 
}: EnhancedCardProps) {
  const baseClasses = 'transition-all duration-200'
  
  const variantClasses = {
    default: 'bg-card border-border',
    elevated: 'bg-card border-border shadow-md',
    outlined: 'bg-transparent border-2 border-border',
    glass: 'bg-card/50 backdrop-blur-sm border-border/50'
  }

  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-[1.02]' : ''
  const interactiveClasses = interactive ? 'cursor-pointer active:scale-[0.98]' : ''

  return (
    <Card 
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        interactiveClasses,
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  )
}

// Feature card for highlighting key features
interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  className?: string
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  className,
  variant = 'default'
}: FeatureCardProps) {
  const variantClasses = {
    default: 'border-primary/20 bg-primary/5',
    primary: 'border-primary/30 bg-primary/10',
    success: 'border-green-500/30 bg-green-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10'
  }

  return (
    <EnhancedCard 
      className={cn('text-center p-6', variantClasses[variant], className)}
      hover
    >
      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <CardTitle className="text-lg mb-2">{title}</CardTitle>
      <p className="text-sm text-muted-foreground">{description}</p>
    </EnhancedCard>
  )
}

// Stat card for displaying metrics
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className 
}: StatCardProps) {
  return (
    <EnhancedCard className={cn('p-4', className)} hover>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </EnhancedCard>
  )
}

// Action card for interactive content
interface ActionCardProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
  onClick?: () => void
}

export function ActionCard({ 
  title, 
  description, 
  action, 
  icon, 
  className,
  onClick 
}: ActionCardProps) {
  return (
    <EnhancedCard 
      className={cn('p-6', className)}
      interactive={!!onClick}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg mb-2">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
          )}
          {action && (
            <div className="flex items-center justify-between">
              {action}
            </div>
          )}
        </div>
      </div>
    </EnhancedCard>
  )
}

// Info card for displaying information with status
interface InfoCardProps {
  title: string
  content: ReactNode
  status?: 'info' | 'success' | 'warning' | 'error'
  badge?: string
  className?: string
}

export function InfoCard({ 
  title, 
  content, 
  status = 'info',
  badge,
  className 
}: InfoCardProps) {
  const statusClasses = {
    info: 'border-blue-500/20 bg-blue-500/5',
    success: 'border-green-500/20 bg-green-500/5',
    warning: 'border-yellow-500/20 bg-yellow-500/5',
    error: 'border-red-500/20 bg-red-500/5'
  }

  const statusColors = {
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white'
  }

  return (
    <EnhancedCard className={cn('p-4', statusClasses[status], className)}>
      <CardHeader className="p-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {badge && (
            <Badge className={statusColors[status]} variant="secondary">
              {badge}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {content}
      </CardContent>
    </EnhancedCard>
  )
}

// Comparison card for side-by-side content
interface ComparisonCardProps {
  leftTitle: string
  leftValue: string | number
  rightTitle: string
  rightValue: string | number
  className?: string
  showComparison?: boolean
}

export function ComparisonCard({ 
  leftTitle, 
  leftValue, 
  rightTitle, 
  rightValue, 
  className,
  showComparison = true
}: ComparisonCardProps) {
  const leftNum = typeof leftValue === 'number' ? leftValue : parseFloat(leftValue)
  const rightNum = typeof rightValue === 'number' ? rightValue : parseFloat(rightValue)
  const difference = rightNum - leftNum
  const percentageChange = leftNum !== 0 ? (difference / leftNum) * 100 : 0

  return (
    <EnhancedCard className={cn('p-4', className)} hover>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">{leftTitle}</p>
          <p className="text-2xl font-bold text-foreground">{leftValue}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">{rightTitle}</p>
          <p className="text-2xl font-bold text-foreground">{rightValue}</p>
        </div>
      </div>
      
      {showComparison && (
        <div className="mt-4 pt-4 border-t border-border/20">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Change</p>
            <p className={cn(
              'text-lg font-semibold',
              difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-foreground'
            )}>
              {difference > 0 ? '+' : ''}{difference.toFixed(1)} ({percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%)
            </p>
          </div>
        </div>
      )}
    </EnhancedCard>
  )
}
