import { useState } from 'react';
import { CheckCircle, AlertTriangle, Clock, Info, Eye, TrendingUp, FileImage, FileVideo, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AnalysisResult } from '@shared/api';

interface ResultsDashboardProps {
  results: AnalysisResult[];
  onClear: () => void;
}

export function ResultsDashboard({ results, onClear }: ResultsDashboardProps) {
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  if (results.length === 0) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-8 text-center">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Analysis Results Yet
          </h3>
          <p className="text-muted-foreground">
            Upload media or use the camera to start analyzing for deepfakes
          </p>
        </CardContent>
      </Card>
    );
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };

  const getResultIcon = (result: AnalysisResult) => {
    if (result.isDeepfake) {
      return <AlertTriangle className="h-6 w-6 text-danger" />;
    }
    return <CheckCircle className="h-6 w-6 text-success" />;
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-4 w-4" />;
      case 'video': return <FileVideo className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-danger';
  };

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Analysis Results</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear All
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {results.map((result, index) => (
          <Card key={index} className="glass-effect">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Main Result Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getResultIcon(result)}
                    <div>
                      <div className="flex items-center space-x-2">
                        {getFileTypeIcon(result.type)}
                        <span className="font-semibold text-foreground capitalize">
                          {result.type} Analysis
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.isDeepfake ? 'Potential deepfake detected' : 'Appears authentic'}
                      </p>
                    </div>
                  </div>
                  
                  <Badge
                    variant={result.isDeepfake ? 'destructive' : 'default'}
                    className={result.isDeepfake ? '' : 'bg-success text-success-foreground'}
                  >
                    {result.isDeepfake ? 'DEEPFAKE' : 'AUTHENTIC'}
                  </Badge>
                </div>

                {/* Confidence and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className={`font-medium ${getConfidenceColor(result.confidence)}`}>
                        {formatConfidence(result.confidence)}
                      </span>
                    </div>
                    <Progress
                      value={result.confidence * 100}
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Analysis Time</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatDuration(result.analysisTime)}
                    </span>
                  </div>
                </div>

                {/* Detailed Information */}
                <Collapsible
                  open={expandedResults.has(index)}
                  onOpenChange={() => toggleExpanded(index)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between p-2 h-8"
                    >
                      <span className="text-sm">Technical Details</span>
                      <Info className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-3">
                    <div className="space-y-3 p-3 bg-secondary/10 rounded-lg border">
                      {/* Metadata */}
                      {result.metadata && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            Media Information
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/_/g, ' ')}:
                                </span>
                                <span className="text-foreground font-mono">
                                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* API Response Summary */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Analysis Details
                        </h4>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">API Provider:</span>
                            <span className="text-foreground">
                              {result.type === 'audio' ? 'Resemble Detect' : 'Sightengine'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Detection Method:</span>
                            <span className="text-foreground">
                              {result.type === 'audio' ? 'Voice Synthesis Detection' : 'Visual Manipulation Detection'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Processed At:</span>
                            <span className="text-foreground">
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Raw API Data (for debugging) */}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Raw API Response (Debug)
                        </summary>
                        <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(
                            result.type === 'audio' ? result.resembleData : result.sightengineData,
                            null,
                            2
                          )}
                        </pre>
                      </details>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
