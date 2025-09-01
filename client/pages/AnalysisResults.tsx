import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Shield, 
  Camera, 
  FileText,
  BarChart3,
  Clock,
  Zap,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AnalysisResult } from '@shared/api'
import { toast } from '@/hooks/use-toast'

interface LocationState {
  results?: AnalysisResult[]
  currentResult?: AnalysisResult
}

export default function AnalysisResults() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  // Get results from navigation state or localStorage
  useEffect(() => {
    const state = location.state as LocationState
    if (state?.results) {
      setResults(state.results)
      setCurrentResult(state.currentResult || state.results[0])
      setIsLoading(false)
    } else {
      // Fallback to localStorage if no state
      const savedResults = localStorage.getItem('analysisResults')
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults) as AnalysisResult[]
        setResults(parsedResults)
        setCurrentResult(parsedResults[0])
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    }
  }, [location.state])

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    if (confidence >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'image': return <Camera className="h-5 w-5" />
      case 'video': return <FileText className="h-5 w-5" />
      case 'audio': return <Zap className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const exportResults = () => {
    if (!currentResult) return

    const dataStr = JSON.stringify(currentResult, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analysis-result-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Exported!",
      description: "Analysis results exported successfully",
    })
  }

  const shareResults = () => {
    if (!currentResult) return

    const shareData = {
      title: 'Deepfake Analysis Results',
              text: `Analysis Result: ${currentResult?.isDeepfake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC'} (${Math.round((currentResult?.confidence || 0) * 100)}% confidence)`,
      url: window.location.href,
    }

    if (navigator.share) {
      navigator.share(shareData)
    } else {
      copyToClipboard(window.location.href, 'Share URL')
    }
  }

  if (!currentResult) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Analysis Results</h2>
              <p className="text-muted-foreground mb-4">
                No analysis results found. Please perform an analysis first.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analysis results...</p>
        </div>
      </div>
    )
  }

  // Show error state if no results
  if (!currentResult || results.length === 0) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Results Found</h1>
          <p className="text-muted-foreground mb-4">
            No analysis results were found. Please run an analysis first.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <TooltipProvider>
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Analysis Results</h1>
                <p className="text-muted-foreground">
                  {currentResult?.type?.toUpperCase() || 'Loading...'} Analysis • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={shareResults}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Results Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Primary Result Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getAnalysisIcon(currentResult?.type || 'unknown')}
                      <div>
                        <CardTitle className="text-xl">
                          {currentResult?.isDeepfake ? 'Deepfake Detected' : 'Authentic Content'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {currentResult?.type?.toUpperCase() || 'Loading...'} Analysis
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getRiskLevelColor(currentResult?.riskLevel || 'UNKNOWN')}
                    >
                      {currentResult?.riskLevel || 'UNKNOWN'} RISK
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Confidence Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Confidence Score</span>
                      <span className={`text-lg font-bold ${getConfidenceColor((currentResult?.confidence || 0) * 100)}`}>
                        {Math.round((currentResult?.confidence || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(currentResult?.confidence || 0) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(currentResult?.confidenceCategory || 'UNKNOWN').replace('_', ' ')} confidence
                    </p>
                  </div>

                  {/* Analysis Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {currentResult?.isDeepfake ? '⚠️' : '✅'}
                      </div>
                      <div className="text-sm font-medium">
                        {currentResult?.isDeepfake ? 'Deepfake' : 'Authentic'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {(currentResult?.analysisQuality || 'UNKNOWN') === 'DEMO' ? '🧪' : '🔬'}
                      </div>
                      <div className="text-sm font-medium">
                        {currentResult?.analysisQuality || 'UNKNOWN'} Analysis
                      </div>
                    </div>
                  </div>

                  {/* Key Findings */}
                  <div>
                    <h3 className="font-semibold mb-3">Key Findings</h3>
                    <div className="space-y-2">
                      {currentResult?.recommendations?.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      )) || (
                        <p className="text-sm text-muted-foreground">No key findings available</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis Tabs */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="technical">Technical</TabsTrigger>
                      <TabsTrigger value="metadata">Metadata</TabsTrigger>
                      <TabsTrigger value="raw">Raw Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Processing Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>API Provider:</span>
                              <span className="font-medium">{currentResult?.processingDetails?.apiProvider || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Models Used:</span>
                              <span className="font-medium">{currentResult?.processingDetails?.modelsUsed?.join(', ') || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quality Score:</span>
                              <span className="font-medium">{Math.round((currentResult?.processingDetails?.qualityScore || 0) * 100)}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Confidence Factors</h4>
                          <div className="space-y-2">
                            {currentResult?.processingDetails?.confidenceFactors?.map((factor, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>{factor.factor}:</span>
                                <Badge variant="outline" className="text-xs">
                                  {factor.impact}
                                </Badge>
                              </div>
                            )) || (
                              <p className="text-sm text-muted-foreground">No confidence factors available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="technical" className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3">Technical Analysis</h4>
                        {currentResult?.type === 'image' && currentResult?.imageAnalysis && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Face Detection</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Faces Detected:</span>
                                      <span>{currentResult?.imageAnalysis?.faceDetection?.facesDetected || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Face Quality:</span>
                                      <span>{Math.round((currentResult?.imageAnalysis?.faceDetection?.faceQuality || 0) * 100)}%</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Manipulation Indicators</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Compression Artifacts:</span>
                                      <span>{Math.round((currentResult?.imageAnalysis?.manipulationIndicators?.compressionArtifacts || 0) * 100)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Editing Signs:</span>
                                      <span>{Math.round((currentResult?.imageAnalysis?.manipulationIndicators?.editingSigns || 0) * 100)}%</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="metadata" className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3">File Metadata</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm overflow-x-auto">
                            {JSON.stringify(currentResult?.metadata || {}, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="raw" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Raw API Response</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                        >
                          {showTechnicalDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {showTechnicalDetails ? 'Hide' : 'Show'} Details
                        </Button>
                      </div>
                      {showTechnicalDetails && (
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(currentResult || {}, null, 2)}
                          </pre>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Analysis History */}
              {results.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analysis History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.slice(0, 5).map((result, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentResult(result)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            currentResult === result
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getAnalysisIcon(result?.type || 'unknown')}
                              <span className="text-sm font-medium">
                                {result?.type?.toUpperCase() || 'UNKNOWN'}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={result?.isDeepfake ? 'border-red-200 text-red-700' : 'border-green-200 text-green-700'}
                            >
                              {result?.isDeepfake ? 'Fake' : 'Real'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Math.round((result?.confidence || 0) * 100)}% confidence
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentResult?.recommendations?.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">No recommendations available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Limitations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Limitations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                        <span className="text-sm">View Limitations</span>
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="space-y-2">
                        {currentResult?.limitations?.map((limitation, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {limitation}
                          </div>
                        )) || (
                          <p className="text-sm text-muted-foreground">No limitations documented</p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>

              {/* Analysis Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Analysis Time:</span>
                      <span className="font-medium">{currentResult?.analysisTime || 0}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Analysis Quality:</span>
                      <Badge variant="outline" className="text-xs">
                        {currentResult?.analysisQuality || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Risk Level:</span>
                      <Badge variant="outline" className={`text-xs ${getRiskLevelColor(currentResult?.riskLevel || 'UNKNOWN')}`}>
                        {currentResult?.riskLevel || 'UNKNOWN'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}
