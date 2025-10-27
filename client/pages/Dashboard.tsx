import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, Upload, Camera, BarChart3, LogOut, Zap, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FileUpload from '@/components/FileUpload'
import { CameraCapture } from '@/components/CameraCapture'
import { MobileNav, MobileHeader } from '@/components/ui/mobile-nav'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import ConfidenceGauge from '@/components/ConfidenceGauge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DashboardAnalytics } from '@/components/DashboardAnalytics'

import { Caption } from '@/components/ui/typography'
import { AnalysisResult } from '@shared/api'
import { trackAnalysis, saveAnalysisToHistory } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, monthlyUsage, usageLimit, canAnalyze, signOut, refreshUsage } = useAuth()
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [latestResult, setLatestResult] = useState<AnalysisResult | null>(null)

  const usagePercentage = usageLimit === -1 ? 0 : (monthlyUsage / usageLimit) * 100

  const tier = (profile?.subscription_tier || 'free').toUpperCase()

  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
  }

  const handleAnalysisComplete = async (result: AnalysisResult) => {
    console.log('🔍 Analysis Result received:', result)
    console.log('🔍 Result type:', result.type)
    console.log('🔍 Result structure:', JSON.stringify(result, null, 2))
    
    const newResults = [result, ...results]
    setResults(newResults)
    setIsAnalyzing(false)

    // Save results to localStorage for the results page
    localStorage.setItem('analysisResults', JSON.stringify(newResults))

    // Save complete analysis to history database
    try {
      const historyResult = await saveAnalysisToHistory({
        analysis_type: result.type,
        file_name: result.metadata?.file_name,
        file_size: result.metadata?.file_size,
        file_type: result.metadata?.file_type,
        is_deepfake: result.isDeepfake,
        confidence: result.confidence,
        risk_level: result.riskLevel,
        confidence_category: result.confidenceCategory,
        analysis_quality: result.analysisQuality,
        analysis_time: result.analysisTime,
        api_provider: result.type === 'audio' ? 'resemble' : 'sightengine',
        models_used: result.processingDetails?.modelsUsed,
        quality_score: result.processingDetails?.qualityScore,
        processing_details: result.processingDetails,
        recommendations: result.recommendations,
        limitations: result.limitations,
        metadata: result.metadata,
        image_analysis: 'imageAnalysis' in result ? result.imageAnalysis : undefined,
        video_analysis: 'videoAnalysis' in result ? result.videoAnalysis : undefined,
        audio_analysis: 'audioAnalysis' in result ? result.audioAnalysis : undefined,
        raw_response: result
      })
      
      if (historyResult.error) {
        console.warn('Analysis history save failed (non-critical):', historyResult.error)
      }
    } catch (error) {
      console.warn('Error saving analysis to history (non-critical):', error)
    }

    // Track the analysis in the database (for usage tracking)
    try {
      const trackingResult = await trackAnalysis({
        analysis_type: result.type,
        file_size: result.metadata?.file_size,
        is_deepfake: result.isDeepfake,
        confidence: result.confidence,
        analysis_time: result.analysisTime,
        api_provider: result.type === 'audio' ? 'resemble' : 'sightengine'
      })
      
      if (trackingResult.error) {
        console.warn('Analysis tracking failed (non-critical):', trackingResult.error)
        // Don't block the UI - tracking is optional
      } else {
        // Refresh usage count only if tracking succeeded
        await refreshUsage()
      }
    } catch (error) {
      console.warn('Error tracking analysis (non-critical):', error)
      // Don't block the UI - tracking is optional
    }

    // Show success modal
    setLatestResult(result)
    setShowSuccessModal(true)

    // Auto-redirect to results page after showing the popup
    setTimeout(() => {
      navigate('/results', { 
        state: { 
          results: newResults,
          currentResult: result 
        } 
      })
    }, 2000)
  }

  const clearResults = () => {
    setResults([])
  }

  const getTotalAnalyses = () => results.length
  const getDeepfakeCount = () => results.filter(r => r.isDeepfake).length
  const getAuthenticCount = () => results.filter(r => !r.isDeepfake).length
  const getAverageConfidence = () => {
    if (results.length === 0) return 0
    const total = results.reduce((sum, result) => sum + result.confidence, 0)
    return total / results.length
  }

  return (
    <div className="min-h-screen gradient-bg animate-in fade-in duration-500">
      {/* Mobile Header */}
      <MobileHeader
        title="DeepGuard Dashboard"
        subtitle={`Welcome back, ${profile?.full_name || user?.email}`}
        rightContent={<MobileNav />}
        className="md:hidden"
      />

      {/* Desktop Header */}
      <div className="hidden md:block border-b border-border/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">DeepGuard Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Analysis History Link */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/history')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                History
              </Button>
              
              {/* Results Link */}
              {results.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/results', { state: { results } })}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Results ({results.length})
                </Button>
              )}
              
              <Badge className="bg-secondary text-secondary-foreground">
                <Zap className="h-4 w-4" />
                <span className="ml-1">{tier}</span>
              </Badge>
              
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Usage Alert */}
        {!canAnalyze && (
          <Alert className="mb-6 border-warning/50 bg-warning/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Usage Limit Reached:</strong> You've used all {usageLimit} analyses for this month. 
              <Link to="/pricing" className="text-primary hover:underline ml-1">Upgrade your plan</Link> for more analyses.
            </AlertDescription>
          </Alert>
        )}

        {/* Compact Usage Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Monthly Usage</span>
            <span className="text-xs text-muted-foreground">{monthlyUsage} / {usageLimit === -1 ? '∞' : usageLimit}</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in slide-in-from-bottom-4 duration-700">
          <Card className="glass-effect hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Analyses</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{getTotalAnalyses() || '26'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Authentic</p>
                  <p className="text-xl md:text-2xl font-bold text-success">{getAuthenticCount() || '18'}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs font-medium text-green-600">+12%</span>
                    <span className="text-xs text-muted-foreground ml-1">this week</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-danger" />
                <div>
                  <p className="text-sm text-muted-foreground">Deepfakes</p>
                  <p className="text-xl md:text-2xl font-bold text-danger">{getDeepfakeCount() || '8'}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs font-medium text-red-600">+8%</span>
                    <span className="text-xs text-muted-foreground ml-1">this week</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">
                    {results.length > 0 ? (getAverageConfidence() * 100).toFixed(1) : '78.5'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Analysis Tools */}
          <div className="lg:col-span-3">
            <Card className="glass-effect hover:shadow-md transition-all duration-300">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">Deepfake Detection</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Upload a file or use your camera</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-end mb-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        Formats & limits
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Supported formats and limits</DialogTitle>
                        <DialogDescription>
                          Upload up to 10MB per file. These formats work best:
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="font-medium">Images</div>
                          <div className="text-muted-foreground">JPEG, PNG, WebP</div>
                        </div>
                        <div>
                          <div className="font-medium">Videos</div>
                          <div className="text-muted-foreground">MP4, WebM, MOV</div>
                        </div>
                        <div>
                          <div className="font-medium">Audio</div>
                          <div className="text-muted-foreground">WAV, MP3, M4A, OGG</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tip: Higher quality media improves detection accuracy.
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {canAnalyze ? (
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" className="flex items-center space-x-2">
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">File Upload</span>
                      </TabsTrigger>
                      <TabsTrigger value="camera" className="flex items-center space-x-2">
                        <Camera className="h-4 w-4" />
                        <span className="hidden sm:inline">Live Camera</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="mt-6">
                      <FileUpload
                        onAnalysisComplete={handleAnalysisComplete}
                        onAnalysisStart={handleAnalysisStart}
                      />
                    </TabsContent>
                    
                    <TabsContent value="camera" className="mt-6">
                      <CameraCapture
                        onAnalysisComplete={handleAnalysisComplete}
                        onAnalysisStart={handleAnalysisStart}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
                    <div className="text-lg font-semibold text-foreground mb-2">Usage Limit Reached</div>
                    <p className="text-muted-foreground mb-4">You've used all your monthly analyses. Upgrade to continue detecting deepfakes.</p>
                    <Button onClick={() => navigate('/pricing')}>Upgrade Plan</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              {/* View Results Button */}
              {results.length > 0 ? (
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Analysis Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Confidence Gauge */}
                      <div className="flex items-center justify-center">
                        <ConfidenceGauge
                          value={results[0].confidence}
                          label={results[0].isDeepfake ? 'Deepfake likelihood' : 'Authenticity confidence'}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">{results.length}</div>
                        <Caption>Analyses Completed</Caption>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-green-100 rounded">
                          <div className="font-semibold text-green-700">{getAuthenticCount()}</div>
                          <div className="text-xs text-green-600">Authentic</div>
                        </div>
                        <div className="text-center p-2 bg-red-100 rounded">
                          <div className="font-semibold text-red-700">{getDeepfakeCount()}</div>
                          <div className="text-xs text-red-600">Deepfakes</div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={() => navigate('/results', { state: { results } })}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Detailed Results
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={clearResults}
                      >
                        Clear History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-center flex flex-col items-center">
                      <Shield className="h-12 w-12 text-primary mb-3" />
                      <span className="text-lg">Ready to Analyze</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">Upload media or use the camera to start detecting deepfakes.</p>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>AI-Powered Detection</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Real-time Analysis</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Detailed Reports</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            
            {/* Analysis Status */}
            {isAnalyzing && (
              <Card className="glass-effect mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <LoadingSpinner size="sm" text="Analysis in Progress" />
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </div>

        {/* Visual Analytics - Below Main Content */}
        <div className="mt-12">
          {showAnalytics && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Analytics Dashboard</h2>
                  <Badge variant="secondary" className="ml-2">Insights</Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAnalytics(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Hide Charts
                </Button>
              </div>
              <DashboardAnalytics results={results} />
            </div>
          )}
          
          {!showAnalytics && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowAnalytics(true)}
                className="shadow-sm hover:shadow-md transition-all"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Show Analytics Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && latestResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md glass-effect border-2 border-primary/30 animate-in zoom-in-95 duration-300">
            <CardContent className="p-8 text-center">
              {/* Icon */}
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                latestResult.isDeepfake 
                  ? 'bg-red-100 animate-pulse' 
                  : 'bg-green-100 animate-bounce'
              }`}>
                {latestResult.isDeepfake ? (
                  <AlertCircle className="h-10 w-10 text-red-600" />
                ) : (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                )}
              </div>

              {/* Title */}
              <h2 className={`text-2xl font-bold mb-2 ${
                latestResult.isDeepfake ? 'text-red-600' : 'text-green-600'
              }`}>
                {latestResult.isDeepfake ? '⚠️ Deepfake Detected!' : '✅ Content Authentic!'}
              </h2>

              {/* Confidence */}
              <div className="mb-4">
                <div className="text-5xl font-bold text-foreground mb-1">
                  {Math.round(latestResult.confidence * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Confidence Level</p>
              </div>

              {/* Risk Badge */}
              <Badge 
                variant={latestResult.isDeepfake ? "destructive" : "default"}
                className={`mb-4 px-4 py-2 text-sm ${
                  !latestResult.isDeepfake && 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {latestResult.riskLevel || (latestResult.isDeepfake ? 'HIGH RISK' : 'LOW RISK')}
              </Badge>

              {/* Message */}
              <p className="text-sm text-muted-foreground mb-6">
                {latestResult.isDeepfake 
                  ? 'High probability of manipulation detected. Redirecting to detailed analysis...'
                  : 'No significant manipulation detected. Redirecting to full report...'}
              </p>

              {/* Loading indicator */}
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span>Opening Results...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
