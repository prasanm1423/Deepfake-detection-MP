import { useState, useEffect } from 'react'
import { AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface RateLimitInfo {
  minute: number
  hour: number
  day: number
  nextReset: number
}

interface RateLimitError {
  error: string
  message: string
  retryAfter?: number
  limits?: {
    remaining: RateLimitInfo
    limits: any
  }
}

interface RateLimitHandlerProps {
  error: RateLimitError | null
  onRetry: () => void
  onDismiss: () => void
}

export function RateLimitHandler({ error, onRetry, onDismiss }: RateLimitHandlerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (error?.retryAfter) {
      setTimeRemaining(error.retryAfter)
    }
  }, [error])

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleRetry = async () => {
    if (timeRemaining > 0) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  if (!error) return null

  const isRateLimitError = error.error.includes('rate limit') || error.error.includes('Rate limit')
  const isExternalAPIError = error.error.includes('External API')

  return (
    <Card className="glass-effect border-warning/50 bg-warning/5">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-warning">
          <AlertCircle className="h-5 w-5" />
          <span>Rate Limit Exceeded</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>

        {timeRemaining > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time remaining:</span>
              <span className="font-mono font-medium text-warning">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Progress 
              value={((error.retryAfter || 0) - timeRemaining) / (error.retryAfter || 1) * 100} 
              className="h-2"
            />
          </div>
        )}

        {error.limits && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">API Usage Limits:</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-background rounded">
                <div className="font-semibold text-primary">
                  {error.limits.remaining.minute}
                </div>
                <div className="text-muted-foreground">Per Minute</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="font-semibold text-primary">
                  {error.limits.remaining.hour}
                </div>
                <div className="text-muted-foreground">Per Hour</div>
              </div>
              <div className="text-center p-2 bg-background rounded">
                <div className="font-semibold text-primary">
                  {error.limits.remaining.day}
                </div>
                <div className="text-muted-foreground">Per Day</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {timeRemaining > 0 ? (
            <Button 
              variant="outline" 
              disabled 
              className="flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>Wait {formatTime(timeRemaining)}</span>
            </Button>
          ) : (
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </Button>
        </div>

        {isExternalAPIError && (
          <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded">
            <p className="font-medium mb-1">What happened?</p>
            <p>
              The external AI service (Sightengine/Resemble) has rate limits to prevent abuse. 
              This is normal and helps keep the service available for all users.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RateLimitHandler
