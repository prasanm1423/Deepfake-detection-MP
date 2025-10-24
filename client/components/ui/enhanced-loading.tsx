import React from 'react'
import { cn } from '@/lib/utils'

interface EnhancedLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  variant?: 'default' | 'pulse' | 'dots' | 'spinner'
  className?: string
}

export function EnhancedLoading({ 
  size = 'md', 
  text, 
  variant = 'default',
  className 
}: EnhancedLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
        {text && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        <div className={cn(
          'bg-primary rounded-full animate-pulse',
          sizeClasses[size]
        )} />
        {text && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'spinner') {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        <div className={cn(
          'border-2 border-primary/20 border-t-primary rounded-full animate-spin',
          sizeClasses[size]
        )} />
        {text && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className={cn(
        'border-2 border-primary/20 border-t-primary rounded-full animate-spin',
        sizeClasses[size]
      )} />
      {text && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  )
}

interface AnalysisProgressProps {
  stage: 'uploading' | 'processing' | 'analyzing' | 'complete'
  progress: number
  message?: string
}

export function AnalysisProgress({ stage, progress, message }: AnalysisProgressProps) {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'uploading': return '📤'
      case 'processing': return '⚙️'
      case 'analyzing': return '🔍'
      case 'complete': return '✅'
      default: return '⏳'
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'uploading': return 'text-blue-500'
      case 'processing': return 'text-yellow-500'
      case 'analyzing': return 'text-purple-500'
      case 'complete': return 'text-green-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-4 p-4 bg-secondary/10 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStageIcon(stage)}</span>
          <span className={cn('font-medium', getStageColor(stage))}>
            {stage.charAt(0).toUpperCase() + stage.slice(1)}...
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="w-full bg-secondary/20 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('glass-effect p-4 space-y-3', className)}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-secondary/50 rounded-lg animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-secondary/50 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-secondary/50 rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-secondary/50 rounded animate-pulse" />
        <div className="h-2 bg-secondary/50 rounded animate-pulse w-5/6" />
      </div>
    </div>
  )
}
