import { useState, useRef, useCallback } from 'react';
import { Upload, FileImage, FileVideo, Music, X, Loader2, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner, ProgressBar } from '@/components/ui/loading-spinner';
import { InlineError } from '@/components/ui/error-boundary';
import { ALL_SUPPORTED_TYPES, getFileCategory, AnalysisResult } from '@shared/api';

interface FileUploadProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAnalysisStart: () => void;
}

export function FileUpload({ onAnalysisComplete, onAnalysisStart }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState<'uploading' | 'processing' | 'complete'>('uploading');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    setError(null);
    setRetryCount(0);
    
    // Check file type
    const category = getFileCategory(file.type);
    if (category === 'unsupported') {
      setError('Unsupported file type. Please upload an image, video, or audio file.');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setUploadProgress(0);
    setError(null);
    setAnalysisStage('uploading');
    onAnalysisStart();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setAnalysisStage('processing');

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisStage('complete');
      
      // Small delay to show completion state
      setTimeout(() => {
        onAnalysisComplete(data.result);
        setSelectedFile(null);
        setAnalysisStage('uploading');
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setRetryCount(prev => prev + 1);
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    setRetryCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retryAnalysis = () => {
    setError(null);
    analyzeFile();
  };

  const getFileIcon = (file: File) => {
    const category = getFileCategory(file.type);
    switch (category) {
      case 'image': return <FileImage className="h-8 w-8 text-primary" />;
      case 'video': return <FileVideo className="h-8 w-8 text-primary" />;
      case 'audio': return <Music className="h-8 w-8 text-primary" />;
      default: return <Upload className="h-8 w-8 text-primary" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStageText = () => {
    switch (analysisStage) {
      case 'uploading': return 'Uploading file...';
      case 'processing': return 'Analyzing content...';
      case 'complete': return 'Analysis complete!';
      default: return 'Processing...';
    }
  };

  return (
    <Card className="p-6 glass-effect">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Upload Media for Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Support for images, videos, and audio files (max 10MB)
          </p>
        </div>

        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-primary bg-primary/5 scale-105'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4 transition-colors" />
            <p className="text-foreground font-medium mb-2">
              Drag and drop your file here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ALL_SUPPORTED_TYPES.join(',')}
              onChange={handleFileInputChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile)}
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {getFileCategory(selectedFile.type)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                disabled={isAnalyzing}
                className="hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-4 p-4 bg-secondary/10 rounded-lg">
                <div className="flex items-center justify-center space-x-3">
                  {analysisStage === 'complete' ? (
                    <CheckCircle className="h-6 w-6 text-green-500 animate-pulse" />
                  ) : (
                    <LoadingSpinner size="md" text={getStageText()} />
                  )}
                </div>
                
                {analysisStage !== 'complete' && (
                  <ProgressBar 
                    value={uploadProgress} 
                    variant={uploadProgress > 80 ? 'success' : 'default'}
                    className="max-w-md mx-auto"
                  />
                )}
                
                {analysisStage === 'complete' && (
                  <div className="text-center text-green-600 font-medium">
                    Redirecting to results...
                  </div>
                )}
              </div>
            )}

            {!isAnalyzing && (
              <Button
                onClick={analyzeFile}
                className="w-full hover:bg-primary/90 transition-colors"
              >
                <Shield className="h-4 w-4 mr-2" />
                Analyze for Deepfakes
              </Button>
            )}
          </div>
        )}

        {error && (
          <InlineError
            message={error}
            type="error"
            onRetry={retryCount < 3 ? retryAnalysis : undefined}
            className="mt-4"
          />
        )}

        {retryCount >= 3 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Multiple attempts failed. Please check your connection or try again later.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
