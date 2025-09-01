import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Video, Square, Play, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalysisResult } from '@shared/api';

interface CameraCaptureProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAnalysisStart: () => void;
}

export function CameraCapture({ onAnalysisComplete, onAnalysisStart }: CameraCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [capturedMedia, setCapturedMedia] = useState<{ blob: Blob; type: 'image' | 'video' } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      streamRef.current = stream;
      setIsStreaming(true);
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    setIsRecording(false);
    stopRecordingTimer();
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedMedia({ blob, type: 'image' });
      }
    }, 'image/jpeg', 0.9);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setCapturedMedia({ blob, type: 'video' });
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      startRecordingTimer();
      
    } catch (err) {
      setError('Failed to start recording. Your browser may not support video recording.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopRecordingTimer();
    }
  };

  const startRecordingTimer = () => {
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const analyzeCapturedMedia = async () => {
    if (!capturedMedia) return;

    setIsAnalyzing(true);
    setError(null);
    onAnalysisStart();

    try {
      const formData = new FormData();
      const fileName = capturedMedia.type === 'image' ? 'capture.jpg' : 'recording.webm';
      const mimeType = capturedMedia.type === 'image' ? 'image/jpeg' : 'video/webm';
      
      formData.append('file', capturedMedia.blob, fileName);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || 'Analysis failed');
      }

      onAnalysisComplete(responseData.result);
      setCapturedMedia(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearCapture = () => {
    setCapturedMedia(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card className="p-6 glass-effect">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Live Camera Testing</h3>
          <p className="text-sm text-muted-foreground">
            Capture photos or short videos for real-time deepfake analysis
          </p>
        </div>

        <div className="relative">
          <video
            ref={videoRef}
            className="w-full rounded-lg bg-black"
            style={{ aspectRatio: '4/3' }}
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {isRecording && (
            <div className="absolute top-4 left-4">
              <Badge variant="destructive" className="animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                REC {formatTime(recordingTime)}
              </Badge>
            </div>
          )}
        </div>

        {!isStreaming ? (
          <Button onClick={startCamera} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Start Camera
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={capturePhoto}
              disabled={isRecording || isAnalyzing}
              variant="outline"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
            
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isAnalyzing}
                variant="outline"
              >
                <Video className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        )}

        {isStreaming && (
          <Button
            onClick={stopCamera}
            variant="ghost"
            className="w-full"
          >
            Stop Camera
          </Button>
        )}

        {capturedMedia && (
          <div className="space-y-3">
            <div className="p-4 bg-secondary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {capturedMedia.type === 'image' ? (
                    <Camera className="h-5 w-5 text-primary" />
                  ) : (
                    <Video className="h-5 w-5 text-primary" />
                  )}
                  <span className="text-sm font-medium">
                    {capturedMedia.type === 'image' ? 'Photo captured' : 'Video recorded'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCapture}
                  disabled={isAnalyzing}
                >
                  Clear
                </Button>
              </div>
            </div>

            <Button
              onClick={analyzeCapturedMedia}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                'Analyze for Deepfakes'
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
