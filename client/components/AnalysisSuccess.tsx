import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AnalysisSuccessProps {
  result: any
  onClose: () => void
}

export function AnalysisSuccess({ result, onClose }: AnalysisSuccessProps) {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/results', { 
        state: { 
          results: [result], 
          currentResult: result 
        } 
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [result, navigate])

  const handleViewResults = () => {
    navigate('/results', { 
      state: { 
        results: [result], 
        currentResult: result 
      } 
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Analysis Complete!</h2>
              <p className="text-muted-foreground">
                {result.isDeepfake ? 'Deepfake detected' : 'Content appears authentic'}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm">
              <span>Confidence:</span>
              <span className="font-semibold text-primary">
                {Math.round(result.confidence * 100)}%
              </span>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Stay Here
              </Button>
              <Button onClick={handleViewResults}>
                View Results
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Redirecting to results page in 3 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
