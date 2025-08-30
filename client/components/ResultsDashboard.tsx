import { useState } from 'react';
import { CheckCircle, AlertTriangle, Clock, Info, Eye, TrendingUp, FileImage, FileVideo, Music, Shield, AlertCircle, CheckSquare, XCircle } from 'lucide-react';
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

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getConfidenceCategoryColor = (category: string) => {
    switch (category) {
      case 'VERY_HIGH': return 'text-green-600';
      case 'HIGH': return 'text-green-500';
      case 'MEDIUM': return 'text-yellow-500';
      case 'LOW': return 'text-orange-500';
      case 'VERY_LOW': return 'text-red-500';
      default: return 'text-gray-500';
    }
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
                 {results.map((result, index) => {
           return (
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
                                             <p className="text-sm text-foreground font-medium">
                         {result.isDeepfake ? 'Potential deepfake detected' : 'Appears authentic'}
                       </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Badge
                      variant={result.isDeepfake ? 'destructive' : 'default'}
                      className={result.isDeepfake ? '' : 'bg-success text-success-foreground'}
                    >
                      {result.isDeepfake ? 'DEEPFAKE' : 'AUTHENTIC'}
                    </Badge>
                    
                                         {/* Enhanced Risk Level Badge */}
                     {'riskLevel' in result && result.riskLevel && typeof result.riskLevel === 'string' && (
                       <Badge className={getRiskLevelColor(result.riskLevel)}>
                         <Shield className="h-3 w-3 mr-1" />
                         {result.riskLevel} RISK
                       </Badge>
                     )}
                  </div>
                </div>

                                     {/* Enhanced Analysis Quality */}
                     {'analysisQuality' in result && result.analysisQuality && typeof result.analysisQuality === 'string' && (
                       <div className="flex items-center space-x-2 text-sm">
                         <Info className="h-4 w-4 text-muted-foreground" />
                         <span className="text-muted-foreground">Analysis Quality:</span>
                         <Badge variant={result.analysisQuality === 'DEMO' ? 'secondary' : 'default'}>
                           {result.analysisQuality === 'DEMO' ? 'Demo Mode' : 'API Analysis'}
                         </Badge>
                       </div>
                     )}

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
                    
                                         {/* Enhanced Confidence Category */}
                     {'confidenceCategory' in result && result.confidenceCategory && typeof result.confidenceCategory === 'string' && (
                       <div className="text-xs text-center">
                         <span className={`font-semibold ${getConfidenceCategoryColor(result.confidenceCategory)}`}>
                           {result.confidenceCategory.replace('_', ' ')}
                         </span>
                       </div>
                     )}
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

                                                  {/* Enhanced Recommendations */}
                 {'recommendations' in result && Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
                   <div className="space-y-2">
                     <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                       <CheckSquare className="h-4 w-4 text-green-500" />
                       <span>Recommendations</span>
                     </h4>
                     <div className="space-y-1">
                       {result.recommendations.map((rec, recIndex) => (
                         <div key={recIndex} className="text-xs text-green-900 dark:text-green-100 bg-green-50 dark:bg-green-950/30 p-2 rounded border-l-2 border-green-500 font-medium">
                           {rec}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                                                  {/* Enhanced Limitations */}
                 {'limitations' in result && Array.isArray(result.limitations) && result.limitations.length > 0 && (
                   <div className="space-y-2">
                     <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                       <AlertCircle className="h-4 w-4 text-orange-500" />
                       <span>Limitations & Notes</span>
                     </h4>
                     <div className="space-y-1">
                       {result.limitations.map((lim, limIndex) => (
                         <div key={limIndex} className="text-xs text-orange-900 dark:text-orange-100 bg-orange-50 dark:bg-orange-950/30 p-2 rounded border-l-2 border-orange-500 font-medium">
                           {lim}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

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
                      {/* Enhanced Processing Details */}
                      {'processingDetails' in result && result.processingDetails && (
                                                 <div>
                           <h4 className="text-sm font-semibold text-foreground mb-2">
                             Processing Information
                           </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">API Provider:</span>
                              <span className="text-foreground">{result.processingDetails.apiProvider}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Quality Score:</span>
                              <span className="text-foreground">{(result.processingDetails.qualityScore * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Models Used:</span>
                              <span className="text-foreground">{result.processingDetails.modelsUsed.join(', ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Method:</span>
                              <span className="text-foreground">{result.processingDetails.processingMethod}</span>
                            </div>
                          </div>
                          
                          {/* Confidence Factors */}
                          {result.processingDetails.confidenceFactors && result.processingDetails.confidenceFactors.length > 0 && (
                                                         <div className="mt-3">
                               <h5 className="text-xs font-semibold text-foreground mb-2">Confidence Factors</h5>
                              <div className="space-y-1">
                                {result.processingDetails.confidenceFactors.map((factor, factorIndex) => (
                                                                   <div key={factorIndex} className="text-xs p-2 bg-background rounded border">
                                   <div className="flex justify-between items-center mb-1">
                                     <span className="font-medium text-foreground">{factor.factor}</span>
                                     <Badge variant={factor.impact === 'POSITIVE' ? 'default' : factor.impact === 'NEGATIVE' ? 'destructive' : 'secondary'}>
                                       {factor.impact}
                                     </Badge>
                                   </div>
                                   <p className="text-foreground">{factor.description}</p>
                                   <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                                     <span>Weight: {(factor.weight * 100).toFixed(0)}%</span>
                                   </div>
                                 </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Enhanced Image Analysis */}
                      {'imageAnalysis' in result && result.imageAnalysis && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            Image Analysis Details
                          </h4>
                          
                          {/* Face Detection */}
                          <div className="mb-3">
                            <h5 className="text-xs font-medium text-foreground mb-1">Face Detection</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Faces Detected:</span>
                                <span className="text-foreground">{result.imageAnalysis.faceDetection.facesDetected}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Face Quality:</span>
                                <span className="text-foreground">{(result.imageAnalysis.faceDetection.faceQuality * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Manipulation Indicators */}
                          <div className="mb-3">
                            <h5 className="text-xs font-medium text-foreground mb-1">Manipulation Indicators</h5>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Compression Artifacts:</span>
                                <span className="text-foreground">{(result.imageAnalysis.manipulationIndicators.compressionArtifacts * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Editing Signs:</span>
                                <span className="text-foreground">{(result.imageAnalysis.manipulationIndicators.editingSigns * 100).toFixed(0)}%</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Metadata Issues:</span>
                                <span className="text-foreground">{(result.imageAnalysis.manipulationIndicators.metadataInconsistencies * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Technical Analysis */}
                          <div>
                            <h5 className="text-xs font-medium text-foreground mb-1">Technical Details</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Resolution:</span>
                                <span className="text-foreground">{result.imageAnalysis.technicalAnalysis.resolution}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Color Depth:</span>
                                <span className="text-foreground">{result.imageAnalysis.technicalAnalysis.colorDepth} bit</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Format:</span>
                                <span className="text-foreground">{result.imageAnalysis.technicalAnalysis.compressionType}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

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
        );
        })}
      </div>
    </div>
  );
}
