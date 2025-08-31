import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, Upload, Camera, BarChart3, User, LogOut, Crown, Zap, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/FileUpload'
import { CameraCapture } from '@/components/CameraCapture'
import { AnalysisSuccess } from '@/components/AnalysisSuccess'
import { AnalysisResult } from '@shared/api'
import { trackAnalysis, saveAnalysisToHistory } from '@/lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, monthlyUsage, usageLimit, canAnalyze, signOut, refreshUsage } = useAuth()
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null)


  const usagePercentage = usageLimit === -1 ? 0 : (monthlyUsage / usageLimit) * 100

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'free':
        return {
          name: 'Free',
          icon: <Shield className="h-4 w-4" />,
          color: 'bg-secondary text-secondary-foreground',
          features: ['10 analyses/month', 'Basic detection', '10MB file limit']
        }
      case 'pro':
        return {
          name: 'Pro',
          icon: <Zap className="h-4 w-4" />,
          color: 'bg-primary text-primary-foreground',
          features: ['500 analyses/month', 'All detection models', '50MB file limit', 'API access']
        }
      case 'enterprise':
        return {
          name: 'Enterprise',
          icon: <Crown className="h-4 w-4" />,
          color: 'bg-warning text-warning-foreground',
          features: ['Unlimited analyses', 'Custom models', '100MB file limit', 'Priority support']
        }
      default:
        return {
          name: 'Free',
          icon: <Shield className="h-4 w-4" />,
          color: 'bg-secondary text-secondary-foreground',
          features: ['10 analyses/month', 'Basic detection', '10MB file limit']
        }
    }
  }

  const tierInfo = getTierInfo(profile?.subscription_tier || 'free')



  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
  }

  const handleAnalysisComplete = async (result: AnalysisResult) => {
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
    setLastResult(result)
    setShowSuccess(true)
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
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="border-b border-border/20 backdrop-blur-sm">
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
               

              
              <Badge className={tierInfo.color}>
                {tierInfo.icon}
                <span className="ml-1">{tierInfo.name}</span>
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

        {/* Usage Stats */}
        <Card className="mb-6 glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Monthly Usage</span>
              <div className="text-sm text-muted-foreground">
                {monthlyUsage} / {usageLimit === -1 ? '∞' : usageLimit} analyses
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Usage this month</span>
                <span className={usagePercentage > 80 ? 'text-warning' : usagePercentage > 95 ? 'text-destructive' : ''}>
                  {usagePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

                 {/* Session Stats */}
         {results.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
             <Card className="glass-effect">
               <CardContent className="p-4">
                 <div className="flex items-center space-x-2">
                   <BarChart3 className="h-5 w-5 text-primary" />
                   <div>
                     <p className="text-sm text-muted-foreground">Session Analyses</p>
                     <p className="text-2xl font-bold text-foreground">{getTotalAnalyses()}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>

             <Card className="glass-effect">
               <CardContent className="p-4">
                 <div className="flex items-center space-x-2">
                   <CheckCircle className="h-5 w-5 text-success" />
                   <div>
                     <p className="text-sm text-muted-foreground">Authentic</p>
                     <p className="text-2xl font-bold text-success">{getAuthenticCount()}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>

             <Card className="glass-effect">
               <CardContent className="p-4">
                 <div className="flex items-center space-x-2">
                   <AlertCircle className="h-5 w-5 text-danger" />
                   <div>
                     <p className="text-sm text-muted-foreground">Deepfakes</p>
                     <p className="text-2xl font-bold text-danger">{getDeepfakeCount()}</p>
                   </div>
                 </div>
               </CardContent>
             </Card>

             <Card className="glass-effect">
               <CardContent className="p-4">
                 <div className="flex items-center space-x-2">
                   <Zap className="h-5 w-5 text-primary" />
                   <div>
                     <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                     <p className="text-2xl font-bold text-foreground">
                       {(getAverageConfidence() * 100).toFixed(1)}%
                     </p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
             <Card className="glass-effect">
               <CardContent className="p-6 text-center">
                 <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                   <Camera className="h-6 w-6 text-blue-600" />
                 </div>
                 <h3 className="font-semibold text-foreground mb-2">Upload Images</h3>
                 <p className="text-sm text-muted-foreground">
                   Upload photos to detect face-swap deepfakes and AI-generated content
                 </p>
               </CardContent>
             </Card>

             <Card className="glass-effect">
               <CardContent className="p-6 text-center">
                 <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                   <FileText className="h-6 w-6 text-green-600" />
                 </div>
                 <h3 className="font-semibold text-foreground mb-2">Analyze Videos</h3>
                 <p className="text-sm text-muted-foreground">
                   Check video files for temporal inconsistencies and manipulation
                 </p>
               </CardContent>
             </Card>

             <Card className="glass-effect">
               <CardContent className="p-6 text-center">
                 <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                   <Zap className="h-6 w-6 text-purple-600" />
                 </div>
                 <h3 className="font-semibold text-foreground mb-2">Audio Detection</h3>
                 <p className="text-sm text-muted-foreground">
                   Detect synthetic voices and audio deepfakes with AI analysis
                 </p>
               </CardContent>
             </Card>
           </div>
         )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis Tools */}
          <div className="lg:col-span-2">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Deepfake Detection Tools</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {canAnalyze ? (
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" className="flex items-center space-x-2">
                        <Upload className="h-4 w-4" />
                        <span>File Upload</span>
                      </TabsTrigger>
                      <TabsTrigger value="camera" className="flex items-center space-x-2">
                        <Camera className="h-4 w-4" />
                        <span>Live Camera</span>
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
                    <h3 className="text-lg font-semibold text-foreground mb-2">Usage Limit Reached</h3>
                    <p className="text-muted-foreground mb-4">
                      You've used all your monthly analyses. Upgrade to continue detecting deepfakes.
                    </p>
                    <Button onClick={() => navigate('/pricing')}>Upgrade Plan</Button>
                  </div>
                )}
              </CardContent>
            </Card>

                         {/* Welcome Section - Only show when no results */}
             {results.length === 0 && (
               <Card className="glass-effect mt-6">
                 <CardHeader>
                   <CardTitle className="flex items-center space-x-2">
                     <Shield className="h-5 w-5" />
                     <span>Welcome to DeepGuard</span>
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     <p className="text-sm text-muted-foreground">
                       Start protecting yourself from deepfakes and AI-generated content. 
                       Upload your first file to begin analysis.
                     </p>
                     <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 rounded-lg">
                       <h4 className="font-semibold text-sm mb-2">What we detect:</h4>
                       <ul className="text-xs text-muted-foreground space-y-1">
                         <li>• Face-swap deepfakes</li>
                         <li>• AI-generated images</li>
                         <li>• Synthetic voice cloning</li>
                         <li>• Video manipulation</li>
                       </ul>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             )}

             {/* Current Plan Info */}
             <Card className="glass-effect mt-6">
               <CardHeader>
                 <CardTitle className="flex items-center space-x-2">
                   <User className="h-5 w-5" />
                   <span>Current Plan</span>
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="flex items-center justify-between mb-4">
                   <Badge className={tierInfo.color}>
                     {tierInfo.icon}
                     <span className="ml-1">{tierInfo.name} Plan</span>
                   </Badge>
                   <Button variant="outline" size="sm" onClick={() => navigate('/pricing')}>
                     Upgrade Plan
                   </Button>
                 </div>
                 <ul className="space-y-2 text-sm text-muted-foreground">
                   {tierInfo.features.map((feature, index) => (
                     <li key={index} className="flex items-center">
                       <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                       {feature}
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
          </div>

                     {/* Results Sidebar */}
           <div className="lg:col-span-1">
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
                     <div className="text-center">
                       <div className="text-2xl font-bold text-primary mb-1">{results.length}</div>
                       <p className="text-sm text-muted-foreground">Analyses Completed</p>
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
               <div className="space-y-6">
                 {/* Quick Start Guide */}
                 <Card className="glass-effect">
                   <CardHeader>
                     <CardTitle className="flex items-center space-x-2">
                       <Shield className="h-5 w-5" />
                       <span>Quick Start</span>
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       <div className="flex items-start space-x-3">
                         <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold mt-0.5">
                           1
                         </div>
                         <div>
                           <p className="text-sm font-medium">Upload a file</p>
                           <p className="text-xs text-muted-foreground">Choose an image, video, or audio file</p>
                         </div>
                       </div>
                       <div className="flex items-start space-x-3">
                         <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold mt-0.5">
                           2
                         </div>
                         <div>
                           <p className="text-sm font-medium">AI Analysis</p>
                           <p className="text-xs text-muted-foreground">Our AI will analyze the content</p>
                         </div>
                       </div>
                       <div className="flex items-start space-x-3">
                         <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold mt-0.5">
                           3
                         </div>
                         <div>
                           <p className="text-sm font-medium">Get Results</p>
                           <p className="text-xs text-muted-foreground">View detailed analysis report</p>
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 {/* Supported Formats */}
                 <Card className="glass-effect">
                   <CardHeader>
                     <CardTitle className="flex items-center space-x-2">
                       <FileText className="h-5 w-5" />
                       <span>Supported Formats</span>
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-3">
                       <div>
                         <p className="text-sm font-medium text-blue-600">Images</p>
                         <p className="text-xs text-muted-foreground">JPEG, PNG, WebP (max 10MB)</p>
                       </div>
                       <div>
                         <p className="text-sm font-medium text-green-600">Videos</p>
                         <p className="text-xs text-muted-foreground">MP4, WebM, MOV (max 10MB)</p>
                       </div>
                       <div>
                         <p className="text-sm font-medium text-purple-600">Audio</p>
                         <p className="text-xs text-muted-foreground">WAV, MP3, M4A, OGG (max 10MB)</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 {/* Tips */}
                 <Card className="glass-effect">
                   <CardHeader>
                     <CardTitle className="flex items-center space-x-2">
                       <Zap className="h-5 w-5" />
                       <span>Pro Tips</span>
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-2">
                       <div className="flex items-start space-x-2">
                         <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                         <p className="text-xs text-muted-foreground">Higher resolution images provide better accuracy</p>
                       </div>
                       <div className="flex items-start space-x-2">
                         <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                         <p className="text-xs text-muted-foreground">Use live camera for real-time analysis</p>
                       </div>
                       <div className="flex items-start space-x-2">
                         <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                         <p className="text-xs text-muted-foreground">Check results page for detailed insights</p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>
             )}
             
             {/* Analysis Status */}
             {isAnalyzing && (
               <Card className="glass-effect mt-4">
                 <CardContent className="p-4">
                   <div className="flex items-center space-x-3">
                     <div className="scan-animation w-8 h-1 bg-primary rounded"></div>
                     <div>
                       <p className="font-medium text-foreground">Analysis in Progress</p>
                       <p className="text-sm text-muted-foreground">Processing your media...</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             )}
           </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && lastResult && (
        <AnalysisSuccess 
          result={lastResult} 
          onClose={() => setShowSuccess(false)} 
        />
      )}
    </div>
  )
}
