/**
 * Shared code between client and server
 * API types for deepfake detection application
 */

/**
 * Enhanced analysis result types with detailed reporting
 */
export interface BaseAnalysisResult {
  isDeepfake: boolean;
  confidence: number;
  analysisTime: number;
  metadata?: Record<string, any>;
  // Enhanced fields
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceCategory: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  analysisQuality: 'DEMO' | 'API' | 'ENHANCED';
  processingDetails: ProcessingDetails;
  recommendations: string[];
  limitations: string[];
}

export interface ProcessingDetails {
  apiProvider: string;
  modelsUsed: string[];
  processingMethod: string;
  qualityScore: number;
  confidenceFactors: ConfidenceFactor[];
  processingWarnings?: string[];
}

export interface ConfidenceFactor {
  factor: string;
  weight: number;
  description: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface ImageAnalysisResult extends BaseAnalysisResult {
  type: 'image';
  sightengineData: any;
  // Enhanced image-specific fields
  imageAnalysis: {
    faceDetection: {
      facesDetected: number;
      faceQuality: number;
      facialFeatures: string[];
    };
    manipulationIndicators: {
      compressionArtifacts: number;
      editingSigns: number;
      metadataInconsistencies: number;
    };
    technicalAnalysis: {
      resolution: string;
      colorDepth: number;
      compressionType: string;
      exifData?: Record<string, any>;
    };
  };
}

export interface VideoAnalysisResult extends BaseAnalysisResult {
  type: 'video';
  sightengineData: any;
  // Enhanced video-specific fields
  videoAnalysis: {
    frameAnalysis: {
      totalFrames: number;
      analyzedFrames: number;
      frameRate: number;
      keyFrames: number;
    };
    temporalAnalysis: {
      consistencyScore: number;
      motionPatterns: string[];
      frameVariations: number;
    };
    audioAnalysis?: {
      audioQuality: number;
      voiceConsistency: number;
      backgroundNoise: number;
    };
  };
}

export interface AudioAnalysisResult extends BaseAnalysisResult {
  type: 'audio';
  resembleData: any;
  // Enhanced audio-specific fields
  audioAnalysis: {
    voiceCharacteristics: {
      naturalness: number;
      consistency: number;
      emotionStability: number;
    };
    technicalMetrics: {
      sampleRate: number;
      bitDepth: number;
      duration: number;
      format: string;
    };
    synthesisIndicators: {
      artificialPatterns: number;
      voiceCloningSigns: number;
      backgroundConsistency: number;
    };
  };
}

export type AnalysisResult = ImageAnalysisResult | VideoAnalysisResult | AudioAnalysisResult;

/**
 * Enhanced API Response types
 */
export interface AnalysisResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
  // Enhanced response fields
  analysisId: string;
  timestamp: string;
  version: string;
  processingNotes?: string[];
}

export interface UploadResponse {
  success: boolean;
  fileId?: string;
  fileName?: string;
  error?: string;
}

/**
 * Analysis Report Summary
 */
export interface AnalysisReport {
  summary: {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    recommendation: string;
    keyFindings: string[];
  };
  technicalDetails: {
    processingTime: number;
    apiUsed: string;
    modelsApplied: string[];
    qualityMetrics: Record<string, number>;
  };
  userGuidance: {
    nextSteps: string[];
    cautionNotes: string[];
    verificationTips: string[];
  };
}

/**
 * Supported file types
 */
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mov'];
export const SUPPORTED_AUDIO_TYPES = ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'];

export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_VIDEO_TYPES,
  ...SUPPORTED_AUDIO_TYPES
];

/**
 * File type detection utility
 */
export function getFileCategory(mimeType: string): 'image' | 'video' | 'audio' | 'unsupported' {
  if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (SUPPORTED_VIDEO_TYPES.includes(mimeType)) return 'video';
  if (SUPPORTED_AUDIO_TYPES.includes(mimeType)) return 'audio';
  return 'unsupported';
}

/**
 * Example response type for /api/demo (legacy)
 */
export interface DemoResponse {
  message: string;
}
