import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'error'
  text?: string
  showProgress?: boolean
  progress?: number
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  text,
  showProgress = false,
  progress = 0,
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const variantIcons = {
    default: <Loader2 className={cn(sizeClasses[size], 'animate-spin')} />,
    success: <CheckCircle className={cn(sizeClasses[size], 'text-green-500')} />,
    error: <AlertCircle className={cn(sizeClasses[size], 'text-red-500')} />
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      <div className="relative">
        {variant === 'default' && (
          <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
        )}
        {variantIcons[variant]}
      </div>
      
      {text && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {text}
        </p>
      )}
      
      {showProgress && (
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced progress bar component
interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

export function ProgressBar({ 
  value, 
  max = 100, 
  showLabel = true,
  variant = 'default',
  className 
}: ProgressBarProps) {
  const percentage = (value / max) * 100
  
  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div 
          className={cn(
            'h-2 rounded-full transition-all duration-500 ease-out',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
