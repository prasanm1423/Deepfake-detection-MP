import { useState, useRef, useCallback } from 'react'
import { Upload, File, X, AlertCircle, CheckCircle, Loader2, Camera, Video, Music, Image, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { InlineError } from '@/components/ui/error-boundary'
import { Text, Caption, Label } from '@/components/ui/typography'
import { AnalysisResult } from '@shared/api'

interface FileUploadProps {
  onAnalysisComplete: (result: AnalysisResult) => void
  onAnalysisStart: () => void
}

export default function FileUpload({ onAnalysisComplete, onAnalysisStart }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxRetries = 3
  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8 text-green-500" />
    if (file.type.startsWith('audio/')) return <Music className="h-8 w-8 text-purple-500" />
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  const getFileType = (file: File) => {
    if (file.type.startsWith('image/')) return 'Image'
    if (file.type.startsWith('video/')) return 'Video'
    if (file.type.startsWith('audio/')) return 'Audio'
    return 'File'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size must be less than 10MB. Current size: ${formatFileSize(file.size)}`
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg'
    ]

    if (!allowedTypes.includes(file.type)) {
      return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`
    }

    return null
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
      setIsDragOver(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setIsDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const validationError = validateFile(droppedFile)
      if (validationError) {
        setError(validationError)
        return
      }
      setFile(droppedFile)
      setError(null)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validationError = validateFile(selectedFile)
      if (validationError) {
        setError(validationError)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
    setProgress(0)
    setAnalysisStage('idle')
    setRetryCount(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const retryAnalysis = async () => {
    if (file && retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      setError(null)
      await performAnalysis(file)
    }
  }

  const performAnalysis = async (selectedFile: File) => {
    if (!selectedFile) return

    try {
      setIsAnalyzing(true)
      setError(null)
      setProgress(0)
      setAnalysisStage('uploading')
      onAnalysisStart()

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Create FormData
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Make API call
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      clearInterval(uploadInterval)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setProgress(100)
      setAnalysisStage('processing')

      const responseData = await response.json()

      if (!responseData.success) {
        throw new Error(responseData.error || 'Analysis failed')
      }

      const result: AnalysisResult = responseData.result

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500))

      setAnalysisStage('complete')
      
      // Show completion state briefly with smooth transition
      setTimeout(() => {
        setIsAnalyzing(false)
        onAnalysisComplete(result)
        
        // Reset state after callback
        setTimeout(() => {
          setProgress(0)
          setAnalysisStage('idle')
        }, 300)
      }, 1200)

    } catch (error) {
      console.error('Analysis failed:', error)
      setIsAnalyzing(false)
      setProgress(0)
      setAnalysisStage('idle')
      
      if (retryCount < maxRetries) {
        setError(`Analysis failed. ${retryCount + 1}/${maxRetries} attempts. Click "Try Again" to retry.`)
      } else {
        setError(`Analysis failed after ${maxRetries} attempts. Please check your file and try again later.`)
      }
    }
  }

  const handleAnalyze = () => {
    if (file) {
      performAnalysis(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-primary bg-primary/10 scale-105 shadow-lg'
            : dragActive
            ? 'border-primary bg-primary/5 scale-102'
            : 'border-border hover:border-primary/50 hover:bg-primary/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*"
          className="hidden"
        />

        {!file ? (
          <div className="space-y-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragOver 
                ? 'bg-primary/20 scale-110' 
                : 'bg-primary/10'
            }`}>
              <Upload className={`h-8 w-8 transition-all duration-300 ${
                isDragOver ? 'text-primary scale-110' : 'text-primary'
              }`} />
            </div>
            <div>
              <Text size="lg" weight="semibold" className="mb-2">
                {isDragOver ? 'Drop your file here!' : 'Drop your file here or click to browse'}
              </Text>
              <Caption className="mb-4">
                Supports images, videos, and audio files up to 10MB
              </Caption>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Choose File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              {getFileIcon(file)}
              <div className="text-left">
                <Text weight="semibold">{file.name}</Text>
                <Caption>
                  {getFileType(file)} • {formatFileSize(file.size)}
                </Caption>
              </div>
            </div>
            <Button
              onClick={removeFile}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Remove File
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <InlineError
          message={error}
          onRetry={retryCount < maxRetries ? retryAnalysis : undefined}
        />
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card className="glass-effect border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Text weight="semibold">Analysis in Progress</Text>
                <Badge variant="secondary">
                  {analysisStage === 'uploading' && 'Uploading...'}
                  {analysisStage === 'processing' && 'Processing...'}
                  {analysisStage === 'complete' && 'Complete!'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {analysisStage === 'uploading' && 'Uploading file...'}
                    {analysisStage === 'processing' && 'Analyzing content...'}
                    {analysisStage === 'complete' && 'Analysis complete!'}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <LoadingSpinner
                size="sm"
                text={analysisStage === 'complete' ? 'Analysis Complete!' : 'Processing...'}
                showProgress={false}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Button */}
      {file && !isAnalyzing && (
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Button
            onClick={handleAnalyze}
            size="lg"
            className="min-w-[200px] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Camera className="mr-2 h-5 w-5" />
                Analyze File
              </>
            )}
          </Button>
        </div>
      )}

      {/* File Info */}
      {file && (
        <Card className="glass-effect border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <Text weight="medium">{file.name}</Text>
                  <Caption>
                    {getFileType(file)} • {formatFileSize(file.size)}
                  </Caption>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50">
                {file.type}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  )
}
