/**
 * Shared code between client and server
 * API types for deepfake detection application
 */

/**
 * Analysis result types
 */
export interface BaseAnalysisResult {
  isDeepfake: boolean;
  confidence: number;
  analysisTime: number;
  metadata?: Record<string, any>;
}

export interface ImageAnalysisResult extends BaseAnalysisResult {
  type: 'image';
  sightengineData: any;
}

export interface VideoAnalysisResult extends BaseAnalysisResult {
  type: 'video';
  sightengineData: any;
}

export interface AudioAnalysisResult extends BaseAnalysisResult {
  type: 'audio';
  resembleData: any;
}

export type AnalysisResult = ImageAnalysisResult | VideoAnalysisResult | AudioAnalysisResult;

/**
 * API Response types
 */
export interface AnalysisResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  fileId?: string;
  fileName?: string;
  error?: string;
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
