import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleGoBack = () => {
    window.history.back()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onGoBack={this.handleGoBack}
        />
      )
    }

    return this.props.children
  }
}

// Error fallback component
interface ErrorFallbackProps {
  error?: Error
  errorInfo?: ErrorInfo
  onRetry: () => void
  onGoHome: () => void
  onGoBack: () => void
}

function ErrorFallback({ error, errorInfo, onRetry, onGoHome, onGoBack }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl glass-effect">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Something went wrong</CardTitle>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Error Details</h4>
              <p className="text-sm text-red-700 font-mono break-all">
                {error.message}
              </p>
              {errorInfo && (
                <details className="mt-2">
                  <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                    Stack trace
                  </summary>
                  <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap overflow-auto max-h-32">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={onGoBack} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={onGoHome} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              If this problem continues, please contact our support team with the error details above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Inline error component for form validation and API errors
interface InlineErrorProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  onRetry?: () => void
  className?: string
}

export function InlineError({ message, type = 'error', onRetry, className }: InlineErrorProps) {
  const typeClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const typeIcons = {
    error: <AlertTriangle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <AlertTriangle className="h-4 w-4" />
  }

  return (
    <div className={`p-3 border rounded-lg flex items-start gap-3 ${typeClasses[type]} ${className}`}>
      {typeIcons[type]}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs underline hover:no-underline mt-1"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
