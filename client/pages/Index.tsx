import { useState, useEffect } from 'react';
import { Shield, Zap, AlertCircle, CheckCircle, Eye, Upload, Camera, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/FileUpload';
import { CameraCapture } from '@/components/CameraCapture';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { AnalysisResult } from '@shared/api';

interface ApiStatus {
  sightengineConfigured: boolean;
  resembleConfigured: boolean;
  message: string;
}

export default function Index() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      setStatusError('Failed to check API status');
      console.error('Status check error:', error);
    }
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setResults(prev => [result, ...prev]);
    setIsAnalyzing(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getTotalAnalyses = () => results.length;
  const getDeepfakeCount = () => results.filter(r => r.isDeepfake).length;
  const getAuthenticCount = () => results.filter(r => !r.isDeepfake).length;
  const getAverageConfidence = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.confidence, 0);
    return total / results.length;
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="border-b border-border/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">DeepGuard</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Deepfake Detection</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {apiStatus && (
                <>
                  <Badge
                    variant={apiStatus.sightengineConfigured ? 'default' : 'destructive'}
                    className={apiStatus.sightengineConfigured ? 'bg-success text-success-foreground' : ''}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Sightengine
                  </Badge>
                  <Badge
                    variant={apiStatus.resembleConfigured ? 'default' : 'destructive'}
                    className={apiStatus.resembleConfigured ? 'bg-success text-success-foreground' : ''}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Resemble
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* API Status Alert */}
        {statusError && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{statusError}</AlertDescription>
          </Alert>
        )}

        {apiStatus && (!apiStatus.sightengineConfigured || !apiStatus.resembleConfigured) && (
          <Alert className="mb-6 border-warning/50 bg-warning/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>API Configuration Required:</strong> Some detection services are not configured. 
              {!apiStatus.sightengineConfigured && ' Set SIGHTENGINE_USER and SIGHTENGINE_SECRET environment variables.'}
              {!apiStatus.resembleConfigured && ' Set RESEMBLE_API_KEY environment variable.'}
              {' '}Currently using demo responses for testing.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Analyses</p>
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
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="glass-effect mt-8">
              <CardHeader>
                <CardTitle>How DeepGuard Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="p-3 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">1. Upload Media</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload images, videos, or audio files, or capture content live with your camera
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="p-3 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">2. AI Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced AI algorithms from Sightengine and Resemble analyze your content for deepfake signatures
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="p-3 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">3. Get Results</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive detailed analysis with confidence scores and technical explanations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Sidebar */}
          <div className="lg:col-span-1">
            <ResultsDashboard
              results={results}
              onClear={clearResults}
            />
            
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

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <a href="https://sightengine.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Sightengine
            </a>
            {' '}and{' '}
            <a href="https://www.resemble.ai" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Resemble AI
            </a>
            {' '}• Built with security and privacy in mind
          </p>
        </div>
      </div>
    </div>
  );
}
