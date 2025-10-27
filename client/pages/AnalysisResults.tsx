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
  ExternalLink,
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AnalysisResult } from '@shared/api'
import { toast } from '@/hooks/use-toast'
import { DetailedModelBreakdown } from '@/components/DetailedModelBreakdown'

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
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)

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
    link.download = `deepguard-analysis-${currentResult.type}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "📥 Report Downloaded",
      description: "Your analysis report has been downloaded successfully.",
    })
  }

  const shareResults = async () => {
    if (!currentResult) return

    const shareText = `🔍 DeepGuard Analysis Result\n\n${currentResult.isDeepfake ? '⚠️ Deepfake Detected' : '✅ Authentic Content'}\n\nConfidence: ${Math.round(currentResult.confidence * 100)}%\nRisk Level: ${currentResult.riskLevel}\nAnalysis Time: ${currentResult.analysisTime}ms\n\nAnalyzed with DeepGuard - Advanced Deepfake Detection`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DeepGuard Analysis',
          text: shareText,
        })
        toast({
          title: "📤 Shared Successfully",
          description: "Analysis results have been shared.",
        })
      } catch (error) {
        console.log('Share cancelled or failed:', error)
      }
    } else {
      navigator.clipboard.writeText(shareText)
      toast({
        title: "📋 Copied to Clipboard",
        description: "Analysis results copied to clipboard.",
      })
    }
  }

  // Media viewer functions
  const getMediaUrl = () => {
    // Use saved_filename if available, otherwise fall back to file_name
    const fileName = currentResult?.metadata?.saved_filename || currentResult?.metadata?.file_name
    if (!fileName) return null
    
    const fileType = currentResult.metadata?.file_type || ''
    
    // Use the API endpoint to serve files securely
    return `/api/files/${encodeURIComponent(fileName)}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const MediaViewer = () => {
    if (!currentResult) return null

    const fileType = currentResult.metadata?.file_type || ''
    const fileName = currentResult.metadata?.file_name || 'Unknown file' // Display original name
    const fileSize = currentResult.metadata?.file_size || 0
    const mediaUrl = getMediaUrl()

    console.log('MediaViewer Debug:', {
      fileName,
      fileType,
      fileSize,
      mediaUrl,
      metadata: currentResult.metadata
    })

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const isImage = fileType.startsWith('image/')
    const isVideo = fileType.startsWith('video/')
    const isAudio = fileType.startsWith('audio/')

    if (!isImage && !isVideo && !isAudio) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>File Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{fileName}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isImage && <ImageIcon className="h-5 w-5" />}
            {isVideo && <VideoIcon className="h-5 w-5" />}
            {isAudio && <Music className="h-5 w-5" />}
            <span>Media Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{fileName}</span>
              <span>{formatFileSize(fileSize)}</span>
            </div>

            {/* Media Display */}
            <div className="relative">
              {isImage && (
                <div className="relative group">
                  <img
                    src={mediaUrl || '/placeholder.svg'}
                    alt={fileName}
                    className="w-full h-64 object-cover rounded-lg border"
                    onError={(e) => {
                      console.error('Image load error:', e)
                      e.currentTarget.src = '/placeholder.svg'
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={() => window.open(getMediaUrl(), '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Size
                    </Button>
                  </div>
                </div>
              )}

              {isVideo && (
                <div className="relative">
                  <video
                    src={mediaUrl || undefined}
                    className="w-full h-64 object-cover rounded-lg border"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onError={(e) => {
                      console.error('Video load error:', e)
                    }}
                  >
                    <source src={mediaUrl || ''} type={fileType} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {isAudio && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                    <Music className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <audio
                    src={mediaUrl || undefined}
                    className="w-full"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onError={(e) => {
                      console.error('Audio load error:', e)
                    }}
                  >
                    <source src={mediaUrl || ''} type={fileType} />
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              )}
            </div>

            {/* Media Controls */}
            {(isVideo || isAudio) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlayPause}
                    disabled={!getMediaUrl()}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(mediaUrl, '_blank')}
                    disabled={!mediaUrl}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = mediaUrl || ''
                    link.download = fileName
                    link.click()
                  }}
                  disabled={!mediaUrl}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
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
        <div className="container mx-auto px-4 py-6 animate-in fade-in duration-500">
          {/* Header with Breadcrumb */}
          <div className="mb-4">
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Link to="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">Analysis Results</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-1">Analysis Results</h1>
                <p className="text-muted-foreground">
                  {currentResult?.type?.toUpperCase() || 'Loading...'} Analysis • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="hover:bg-primary/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Analyze Another File
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportResults}
                    className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={shareResults}
                    className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Results
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/history')}
                    className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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

                  {/* Analysis Summary */}
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Analysis Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/15 transition-colors">
                        <span className="text-sm font-semibold text-foreground">API Provider:</span>
                        <Badge variant="outline" className="border-primary/30 text-primary font-medium">
                          {currentResult?.processingDetails?.apiProvider || 'Sightengine'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/30 border border-secondary/40 rounded-lg hover:bg-secondary/40 transition-colors">
                        <span className="text-sm font-semibold text-foreground">Models Used:</span>
                        <span className="text-sm font-bold text-foreground text-right max-w-[150px] truncate">
                          {currentResult?.processingDetails?.modelsUsed?.join(', ') || 'Deepfake Detection'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg hover:bg-success/15 transition-colors">
                        <span className="text-sm font-semibold text-foreground">Processing Time:</span>
                        <span className="text-sm font-bold text-success">{currentResult?.analysisTime || 0}ms</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis - Overview Only */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Detailed Model Breakdown */}
                  {currentResult?.modelBreakdown && (
                    <div className="mb-6">
                      <DetailedModelBreakdown result={currentResult} />
                    </div>
                  )}

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
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Media Viewer */}
              <MediaViewer />
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

              {/* File Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>File Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors">
                      <span className="font-semibold text-foreground">File Name:</span>
                      <span className="font-medium text-foreground text-right max-w-[200px] truncate">{currentResult?.metadata?.file_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors">
                      <span className="font-semibold text-foreground">File Size:</span>
                      <span className="font-medium text-foreground">{currentResult?.metadata?.file_size ? `${(currentResult.metadata.file_size / 1024).toFixed(2)} KB` : 'Unknown'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors">
                      <span className="font-semibold text-foreground">File Type:</span>
                      <Badge variant="outline" className="text-xs font-medium">
                        {currentResult?.metadata?.file_type || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors">
                      <span className="font-semibold text-foreground">Format:</span>
                      <span className="font-medium text-foreground uppercase">{currentResult?.metadata?.format || 'Unknown'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/15 transition-colors">
                      <span className="font-semibold text-foreground">Analysis Time:</span>
                      <span className="font-bold text-primary text-lg">{currentResult?.analysisTime || 0}ms</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg hover:bg-success/15 transition-colors">
                      <span className="font-semibold text-foreground">Quality Score:</span>
                      <span className="font-bold text-success text-lg">{((currentResult?.processingDetails?.qualityScore || 0.9) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 border border-secondary/40 rounded-lg hover:bg-secondary/40 transition-colors">
                      <span className="font-semibold text-foreground">Processing Method:</span>
                      <Badge variant="outline" className="text-xs font-medium">
                        {currentResult?.analysisQuality || 'API'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={exportResults}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Full Report
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={shareResults}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Analysis
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => navigate('/dashboard')}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Analyze Another File
                    </Button>
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
