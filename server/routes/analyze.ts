import { RequestHandler } from "express";
import { AnalysisResponse, getFileCategory } from "../../shared/api.js";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import path from "path";
import fs from "fs";
import { 
  retryWithBackoff, 
  canMakeAPICall, 
  recordAPICall, 
  getRemainingAPICalls,
  checkAPIRateLimit,
  recordAPICallMiddleware
} from "../utils/rateLimiter.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit to match API requirements
  },
  fileFilter: (req, file, cb) => {
    // Enhanced file validation with security checks
    if (!file) {
      cb(new Error('No file provided'));
      return;
    }

    // Check file size before processing
    if (file.size > 10 * 1024 * 1024) {
      cb(new Error('File size exceeds 10MB limit'));
      return;
    }

    // Check for empty files
    if (file.size === 0) {
      cb(new Error('File is empty'));
      return;
    }

    // Validate file type
    const category = getFileCategory(file.mimetype);
    if (category === 'unsupported') {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
      return;
    }

    // Enhanced filename security checks
    if (!file.originalname || file.originalname.length > 255) {
      cb(new Error('Invalid filename'));
      return;
    }

    // Prevent path traversal attacks
    const filename = file.originalname.toLowerCase();
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      cb(new Error('Invalid filename - path traversal not allowed'));
      return;
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar'];
    const fileExt = path.extname(filename).toLowerCase();
    if (suspiciousExtensions.includes(fileExt)) {
      cb(new Error(`File type not allowed: ${fileExt}`));
      return;
    }

    // Log file upload for security monitoring
    console.log(`[FILE_UPLOAD] ${file.originalname} (${file.mimetype}) - Size: ${file.size} bytes - Category: ${category}`);

    cb(null, true);
  }
});

/**
 * Analyze image using real Sightengine API with deepfake and AI-generated detection
 */
async function analyzeImage(filePath: string): Promise<any> {
  const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER;
  const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET;

  if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
    // Graceful fallback to demo response when credentials are missing
    console.log('Sightengine credentials missing. Using image demo fallback.');
    
    // Generate realistic demo scores: 0-1 scale where higher = more likely fake
    const isLikelyDeepfake = Math.random() > 0.8; // 20% chance of deepfake
    const confidence = isLikelyDeepfake
      ? Math.random() * 0.3 + 0.7  // 70-100% for deepfakes (high score = fake)
      : Math.random() * 0.4 + 0.1; // 10-50% for authentic (low score = real)

    // Generate enhanced demo response with detailed analysis
    return generateEnhancedImageResponse(confidence, true, {
      width: 1024,
      height: 768,
      format: 'demo'
    }, null, 'Sightengine API credentials not configured');
  }

  // Use axios with FormData for better compatibility
  console.log('Preparing Sightengine API request...');
  console.log('- models: deepfake');
  console.log('- api_user:', SIGHTENGINE_USER);
  console.log('- file path:', filePath);

  const form = new FormData();

  // Add form fields according to Sightengine API documentation
  form.append('api_user', String(SIGHTENGINE_USER));
  form.append('api_secret', String(SIGHTENGINE_SECRET));
  form.append('models', 'deepfake'); // Only use the valid 'deepfake' model
  
  // Validate file before sending
  const fileStats = fs.statSync(filePath);
  if (fileStats.size === 0) {
    throw new Error('Uploaded file is empty');
  }
  
  // Check file size limit (Sightengine has 10MB limit for images)
  if (fileStats.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  // Get file extension for better debugging
  const fileExtension = filePath.split('.').pop()?.toLowerCase();
  console.log('- File extension:', fileExtension);
  
  // Ensure we're sending the file as a buffer stream
  const fileBuffer = fs.readFileSync(filePath);
  form.append('media', fileBuffer, {
    filename: `image.${fileExtension || 'jpg'}`,
    contentType: `image/${fileExtension || 'jpeg'}`
  });

  try {
    // Check if we can make an API call
    if (!canMakeAPICall('sightengine')) {
      const remaining = getRemainingAPICalls('sightengine');
      throw new Error(`Rate limit exceeded for Sightengine API. Please try again in ${Math.ceil((remaining.nextReset - Date.now()) / 1000)} seconds.`);
    }

    console.log('Sending request to Sightengine API with axios...');
    console.log('Form data contents:');
    console.log('- api_user:', SIGHTENGINE_USER);
    console.log('- api_secret:', SIGHTENGINE_SECRET ? '[HIDDEN]' : 'MISSING');
    console.log('- models: deepfake');
    console.log('- media file exists:', fs.existsSync(filePath));
    console.log('- media file size:', fs.statSync(filePath).size, 'bytes');
    console.log('- media file path:', filePath);
    
    // Record the API call before making it
    recordAPICall('sightengine');
    
    // Use retry with backoff for the API call
    const response = await retryWithBackoff(async () => {
      return await axios.post(
        'https://api.sightengine.com/1.0/check.json',
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
          timeout: 30000, // 30 second timeout
          maxContentLength: 10 * 1024 * 1024, // 10MB limit
          maxBodyLength: 10 * 1024 * 1024, // 10MB limit
        }
      );
    }, 3, 2000); // 3 retries with 2 second base delay

    console.log('Response received. Status:', response.status);
    const data = response.data;
    console.log('Sightengine API response:', JSON.stringify(data, null, 2));

    if (data.status === 'success') {
      // Extract deepfake score from Sightengine API response
      const deepfakeScore = data.deepfake?.prob || data.type?.deepfake || 0;

      // Generate enhanced response with real API data
      return generateEnhancedImageResponse(deepfakeScore, false, {
        width: data.media?.width || 'unknown',
        height: data.media?.height || 'unknown',
        format: data.media?.format || 'unknown'
      }, data);
    } else {
      throw new Error(data.error?.message || 'Sightengine API returned unsuccessful status');
    }
  } catch (error) {
    console.error('Sightengine API error:', error);

    // Log more details for axios errors
    if (axios.isAxiosError(error)) {
      console.log('Axios error details:');
      console.log('- Status:', error.response?.status);
      console.log('- Data:', error.response?.data);
      console.log('- Headers:', error.response?.headers);
      console.log('- Error message:', error.message);
      
      // Log the actual request that failed
      if (error.config) {
        console.log('- Request URL:', error.config.url);
        console.log('- Request method:', error.config.method);
        console.log('- Request headers:', error.config.headers);
      }
      
      // Log the full error response for debugging
      if (error.response?.data) {
        console.log('=== FULL ERROR RESPONSE ===');
        console.log(JSON.stringify(error.response.data, null, 2));
        console.log('=== END ERROR RESPONSE ===');
      }

      // Handle specific HTTP error codes with detailed logging
      if (error.response?.status === 413) {
        console.error('File too large for API - this should not happen with 10MB limit');
      } else if (error.response?.status === 429) {
        console.error('API rate limit exceeded - implementing backoff and retry logic');
        const retryAfter = error.response?.headers?.['retry-after'] || '60';
        throw new Error(`API rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
      } else if (error.response?.status >= 500) {
        console.error('API server error - external service issue');
      }
    }

    // Fallback to demo response if API fails
    console.log('Falling back to demo mode due to API error');
    
    // Try to provide more helpful error information
    let errorDetails = 'API call failed';
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        errorDetails = 'Bad request - check file format and size';
      } else if (error.response?.status === 401) {
        errorDetails = 'Authentication failed - check API credentials';
      } else if (error.response?.status === 413) {
        errorDetails = 'File too large - exceeds API limits';
      } else {
        errorDetails = `HTTP ${error.response?.status}: ${error.response?.data?.error || error.message}`;
      }
    }
    
    // Generate realistic demo scores: 0-1 scale where higher = more likely fake
    const isLikelyDeepfake = Math.random() > 0.8; // 20% chance of deepfake
    const confidence = isLikelyDeepfake
      ? Math.random() * 0.3 + 0.7  // 70-100% for deepfakes (high score = fake)
      : Math.random() * 0.4 + 0.1; // 10-50% for authentic (low score = real)

    return generateEnhancedImageResponse(confidence, true, {
      width: 1024,
      height: 768,
      format: 'demo'
    }, null, errorDetails);
  }
}

/**
 * Analyze video using real Sightengine API with deepfake detection
 */
async function analyzeVideo(filePath: string): Promise<any> {
  const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER;
  const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET;

  if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
    // Graceful fallback to demo response when credentials are missing
    console.log('Sightengine credentials missing. Using video demo fallback.');
    
    // Generate realistic demo scores: 0-1 scale where higher = more likely fake
    const isLikelyDeepfake = Math.random() > 0.8; // 20% chance of deepfake
    const confidence = isLikelyDeepfake
      ? Math.random() * 0.3 + 0.7  // 70-100% for deepfakes (high score = fake)
      : Math.random() * 0.4 + 0.1; // 10-50% for authentic (low score = real)

    return generateEnhancedVideoResponse(confidence, true, {
      duration: 15.6,
      fps: 30,
      resolution: '1920x1080'
    }, null, 'Sightengine API credentials not configured');
  }

  const form = new FormData();

  // Use proper models for video analysis according to Sightengine docs
  form.append('api_user', SIGHTENGINE_USER);
  form.append('api_secret', SIGHTENGINE_SECRET);
  form.append('models', 'deepfake'); // Only use the valid 'deepfake' model
  form.append('media', fs.createReadStream(filePath));

  try {
    console.log('Sending video request to Sightengine API with axios...');

    // Use video check endpoint
    const response = await axios.post(
      'https://api.sightengine.com/1.0/video/check-sync.json',
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 60000, // 60 second timeout for videos
      }
    );

    const data = response.data;
    console.log('Sightengine Video API response:', JSON.stringify(data, null, 2));

    if (data.status === 'success') {
      // Extract deepfake scores from individual frames
      const frames = Array.isArray(data.data?.frames) ? data.data.frames : [];
      
      // Get deepfake scores from all frames
      const frameDeepfakeScores = frames
        .map((frame: any) => frame?.type?.deepfake ?? 0)
        .filter((score: any) => typeof score === 'number' && score >= 0);
      
      // Calculate the maximum deepfake score across all frames
      // This is the correct approach for video analysis
      const maxFrameDeepfake = frameDeepfakeScores.length > 0 ? Math.max(...frameDeepfakeScores) : 0;
      
      // Also check for any summary deepfake score if available
      const summaryDeepfake = data.deepfake?.prob ?? data.type?.deepfake ?? 0;
      
      // Use the highest score between frames and summary
      const finalDeepfakeScore = Math.max(maxFrameDeepfake, summaryDeepfake);
      
      // Log detailed analysis for debugging
      console.log('Video Analysis Details:');
      console.log('- Total frames analyzed:', frames.length);
      console.log('- Frame deepfake scores:', frameDeepfakeScores);
      console.log('- Maximum frame score:', maxFrameDeepfake);
      console.log('- Summary score:', summaryDeepfake);
      console.log('- Final score:', finalDeepfakeScore);
      console.log('- Classification:', finalDeepfakeScore > 0.7 ? 'FAKE' : 'AUTHENTIC');

      return generateEnhancedVideoResponse(finalDeepfakeScore, false, {
        duration: data.media?.duration ?? data.duration ?? 'unknown',
        fps: data.media?.fps ?? data.fps ?? 'unknown',
        resolution: `${(data.media?.width ?? data.width ?? '?')}x${(data.media?.height ?? data.height ?? '?')}`,
        frames_analyzed: frames.length,
        max_frame_score: maxFrameDeepfake
      }, {
        ...data,
        detection_details: {
          face_deepfake: finalDeepfakeScore,
          frame_analysis: {
            total_frames: frames.length,
            frame_scores: frameDeepfakeScores,
            max_score: maxFrameDeepfake
          }
        }
      });
    } else {
      throw new Error(data.error?.message || 'Sightengine Video API returned unsuccessful status');
    }
  } catch (error) {
    console.error('Sightengine Video API error:', error);

    // Log more details for axios errors
    if (axios.isAxiosError(error)) {
      console.log('Video Axios error details:');
      console.log('- Status:', error.response?.status);
      console.log('- Data:', error.response?.data);
    }

    // Fallback to demo response if API fails
    console.log('Falling back to video demo mode due to API error');
    const isLikelyDeepfake = Math.random() > 0.8; // 20% chance for videos
    const confidence = isLikelyDeepfake
      ? Math.random() * 0.25 + 0.05  // 5-30% for deepfakes (low score = fake)
      : Math.random() * 0.35 + 0.65; // 65-100% for authentic (high score = real)

    return generateEnhancedVideoResponse(confidence, true, {
      duration: 15.6,
      fps: 30,
      resolution: '1920x1080'
    }, null, error instanceof Error ? error.message : 'Video API call failed');
  }
}

/**
 * Analyze audio using improved demo response
 */
async function analyzeAudio(filePath: string): Promise<any> {
  // Improved demo response with realistic detection rates
  return new Promise((resolve) => {
    setTimeout(() => {
      // 50% chance of detecting as synthetic voice
      const isSynthetic = Math.random() > 0.5;

      let confidence;
      if (isSynthetic) {
        // High confidence for synthetic detection (70-95%)
        confidence = Math.random() * 0.25 + 0.7;
      } else {
        // High confidence for authentic audio (75-95%)
        confidence = Math.random() * 0.2 + 0.75;
      }

      resolve(generateEnhancedAudioResponse(confidence, isSynthetic, true, {
        duration: 8.5,
        sample_rate: 44100,
        channels: 2
      }));
    }, 2000);
  });
}

/**
 * Test Sightengine API credentials
 */
export const testSightengineAPI: RequestHandler = async (req, res) => {
  try {
    const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER;
    const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET;

    if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
      return res.status(400).json({
        success: false,
        error: 'Sightengine credentials not configured'
      });
    }

    // Test with a simple API call
    const testResponse = await axios.get('https://api.sightengine.com/1.0/check.json', {
      params: {
        api_user: SIGHTENGINE_USER,
        api_secret: SIGHTENGINE_SECRET,
        models: 'deepfake',
        url: 'https://example.com/test.jpg' // Test with a dummy URL
      },
      timeout: 10000
    });

    res.json({
      success: true,
      message: 'Sightengine API credentials are valid',
      response: testResponse.data
    });

  } catch (error) {
    console.error('Sightengine API test error:', error);
    
    if (axios.isAxiosError(error)) {
      res.status(400).json({
        success: false,
        error: 'Sightengine API test failed',
        details: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error during API test'
      });
    }
  }
};

/**
 * Debug file upload and API request
 */
export const debugFileUpload: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const filePath = file.path;
    
    console.log('=== FILE UPLOAD DEBUG ===');
    console.log('File info:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: filePath
    });

    // Check if file exists and get stats
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log('File stats:', {
        exists: true,
        size: stats.size,
        isFile: stats.isFile(),
        created: stats.birthtime,
        modified: stats.mtime
      });
    } else {
      console.log('File does not exist at path:', filePath);
    }

    // Test file reading
    try {
      const fileBuffer = fs.readFileSync(filePath);
      console.log('File buffer size:', fileBuffer.length);
      console.log('File buffer first 100 bytes:', fileBuffer.slice(0, 100));
    } catch (readError) {
      console.log('Error reading file:', readError);
    }

    // Test FormData creation
    const form = new FormData();
    form.append('api_user', process.env.SIGHTENGINE_USER || '');
    form.append('api_secret', process.env.SIGHTENGINE_SECRET || '');
    form.append('models', 'deepfake'); // Only use the valid 'deepfake' model
    
    try {
      const fileBuffer = fs.readFileSync(filePath);
      form.append('media', fileBuffer, {
        filename: file.originalname || 'test.jpg',
        contentType: file.mimetype || 'image/jpeg'
      });
      console.log('FormData created successfully');
    } catch (formError) {
      console.log('Error creating FormData:', formError);
    }

    res.json({
      success: true,
      message: 'File upload debug completed',
      fileInfo: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath,
        exists: fs.existsSync(filePath)
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Debug failed'
    });
  }
};

/**
 * Generate enhanced image analysis response with detailed reporting
 */
function generateEnhancedImageResponse(
  confidence: number, 
  isDemo: boolean, 
  metadata: any, 
  rawApiData?: any,
  errorMessage?: string
) {
  // Calculate risk level based on confidence
  const riskLevel = getRiskLevel(confidence);
  const confidenceCategory = getConfidenceCategory(confidence);
  
  // Debug logging
  console.log(`🔍 Enhanced Image Response Generation:`);
  console.log(`  - Confidence: ${confidence} (${(confidence * 100).toFixed(1)}%)`);
  console.log(`  - Calculated Risk Level: ${riskLevel}`);
  console.log(`  - Calculated Confidence Category: ${confidenceCategory}`);
  console.log(`  - Is Demo: ${isDemo}`);
  
  // Generate recommendations based on analysis
  const recommendations = generateRecommendations(confidence, riskLevel);
  const limitations = generateLimitations(isDemo, confidence);
  
  // Extract technical details from metadata
  const technicalAnalysis = {
    resolution: `${metadata.width || 'unknown'}x${metadata.height || 'unknown'}`,
    colorDepth: 24, // Default assumption
    compressionType: metadata.format || 'unknown',
    exifData: rawApiData?.media?.exif || null
  };

  // Simulate face detection for demo mode
  const faceDetection = isDemo ? {
    facesDetected: Math.floor(Math.random() * 3) + 1,
    faceQuality: Math.random() * 0.5 + 0.5,
    facialFeatures: ['eyes', 'nose', 'mouth']
  } : {
    facesDetected: rawApiData?.faces?.length || 0,
    faceQuality: rawApiData?.faces?.[0]?.quality || 0.8,
    facialFeatures: rawApiData?.faces?.[0]?.features || ['eyes', 'nose', 'mouth']
  };

  // Generate manipulation indicators
  const manipulationIndicators = {
    compressionArtifacts: isDemo ? Math.random() * 0.3 : (rawApiData?.compression_artifacts || 0),
    editingSigns: isDemo ? Math.random() * 0.4 : (rawApiData?.editing_signs || 0),
    metadataInconsistencies: isDemo ? Math.random() * 0.2 : (rawApiData?.metadata_inconsistencies || 0)
  };

  // Debug logging for final response
  console.log(`📤 Final Enhanced Image Response:`);
  console.log(`  - Risk Level: ${riskLevel}`);
  console.log(`  - Confidence Category: ${confidenceCategory}`);
  console.log(`  - Analysis Quality: ${isDemo ? 'DEMO' : 'API'}`);
  console.log(`  - Recommendations count: ${recommendations.length}`);
  console.log(`  - Limitations count: ${limitations.length}`);
  
  return {
    status: 'success',
    deepfake: {
      prob: confidence,
      deepfake_score: confidence,
    },
    metadata: metadata,
    raw_response: rawApiData,
    detection_details: {
      face_deepfake: confidence,
    },
    // Enhanced fields
    riskLevel,
    confidenceCategory,
    analysisQuality: isDemo ? 'DEMO' : 'API',
    processingDetails: {
      apiProvider: 'Sightengine',
      modelsUsed: ['deepfake'],
      processingMethod: 'AI-powered visual analysis',
      qualityScore: isDemo ? 0.6 : 0.9,
      confidenceFactors: [
        {
          factor: 'Visual Consistency',
          weight: 0.4,
          description: 'Analysis of image artifacts and inconsistencies',
          impact: confidence > 0.7 ? 'NEGATIVE' : 'POSITIVE'
        },
        {
          factor: 'Face Detection Quality',
          weight: 0.3,
          description: 'Quality and number of detected faces',
          impact: faceDetection.faceQuality > 0.7 ? 'POSITIVE' : 'NEGATIVE'
        },
        {
          factor: 'Technical Metadata',
          weight: 0.3,
          description: 'File format and compression analysis',
          impact: 'NEUTRAL'
        }
      ],
      processingWarnings: errorMessage ? [errorMessage] : undefined
    },
    recommendations,
    limitations,
    imageAnalysis: {
      faceDetection,
      manipulationIndicators,
      technicalAnalysis
    }
  };
}

/**
 * Generate enhanced video analysis response with detailed reporting
 */
function generateEnhancedVideoResponse(
  confidence: number, 
  isDemo: boolean, 
  metadata: any, 
  rawApiData?: any,
  errorMessage?: string
) {
  // Calculate risk level based on confidence
  const riskLevel = getRiskLevel(confidence);
  const confidenceCategory = getConfidenceCategory(confidence);
  
  // Debug logging
  console.log(`🔍 Enhanced Video Response Generation:`);
  console.log(`  - Confidence: ${confidence} (${(confidence * 100).toFixed(1)}%)`);
  console.log(`  - Calculated Risk Level: ${riskLevel}`);
  console.log(`  - Calculated Confidence Category: ${confidenceCategory}`);
  console.log(`  - Is Demo: ${isDemo}`);
  
  // Generate recommendations based on analysis
  const recommendations = generateRecommendations(confidence, riskLevel);
  const limitations = generateLimitations(isDemo, confidence);
  
  // Extract technical details from metadata
  const technicalAnalysis = {
    resolution: metadata.resolution || 'unknown',
    duration: metadata.duration || 'unknown',
    fps: metadata.fps || 'unknown',
    framesAnalyzed: metadata.frames_analyzed || 0,
    maxFrameScore: metadata.max_frame_score || 0
  };

  // Simulate frame analysis for demo mode
  const frameAnalysis = isDemo ? {
    totalFrames: Math.floor(Math.random() * 30) + 10,
    frameScores: Array.from({length: 5}, () => Math.random() * 0.8),
    maxScore: Math.random() * 0.8,
    averageScore: Math.random() * 0.6
  } : {
    totalFrames: rawApiData?.detection_details?.frame_analysis?.total_frames || 0,
    frameScores: rawApiData?.detection_details?.frame_analysis?.frame_scores || [],
    maxScore: rawApiData?.detection_details?.frame_analysis?.max_score || 0,
    averageScore: rawApiData?.detection_details?.frame_analysis?.frame_scores?.length > 0 
      ? rawApiData.detection_details.frame_analysis.frame_scores.reduce((a: number, b: number) => a + b, 0) / rawApiData.detection_details.frame_analysis.frame_scores.length 
      : 0
  };

  // Generate manipulation indicators for video
  const manipulationIndicators = {
    temporalInconsistencies: isDemo ? Math.random() * 0.4 : (rawApiData?.temporal_artifacts || 0),
    frameEditingSigns: isDemo ? Math.random() * 0.3 : (rawApiData?.frame_editing || 0),
    compressionArtifacts: isDemo ? Math.random() * 0.3 : (rawApiData?.compression_artifacts || 0),
    audioVideoSync: isDemo ? Math.random() * 0.2 : (rawApiData?.av_sync || 0)
  };

  // Debug logging for final response
  console.log(`📤 Final Enhanced Video Response:`);
  console.log(`  - Risk Level: ${riskLevel}`);
  console.log(`  - Confidence Category: ${confidenceCategory}`);
  console.log(`  - Analysis Quality: ${isDemo ? 'DEMO' : 'API'}`);
  console.log(`  - Recommendations count: ${recommendations.length}`);
  console.log(`  - Limitations count: ${limitations.length}`);
  
  return {
    status: 'success',
    deepfake: {
      prob: confidence,
      deepfake_score: confidence,
    },
    metadata: metadata,
    raw_response: rawApiData,
    detection_details: {
      face_deepfake: confidence,
      frame_analysis: frameAnalysis
    },
    // Enhanced fields
    riskLevel,
    confidenceCategory,
    analysisQuality: isDemo ? 'DEMO' : 'API',
    processingDetails: {
      apiProvider: 'Sightengine',
      modelsUsed: ['deepfake'],
      processingMethod: 'AI-powered video frame analysis',
      qualityScore: isDemo ? 0.6 : 0.9,
      confidenceFactors: [
        {
          factor: 'Frame Consistency',
          weight: 0.4,
          description: 'Analysis of temporal consistency across video frames',
          impact: confidence > 0.7 ? 'NEGATIVE' : 'POSITIVE'
        },
        {
          factor: 'Frame Analysis Coverage',
          weight: 0.3,
          description: 'Number and quality of analyzed frames',
          impact: frameAnalysis.totalFrames > 20 ? 'POSITIVE' : 'NEGATIVE'
        },
        {
          factor: 'Temporal Artifacts',
          weight: 0.3,
          description: 'Detection of time-based manipulation indicators',
          impact: 'NEUTRAL'
        }
      ],
      processingWarnings: errorMessage ? [errorMessage] : undefined
    },
    recommendations,
    limitations,
    videoAnalysis: {
      frameAnalysis,
      manipulationIndicators,
      technicalAnalysis
    }
  };
}

/**
 * Generate enhanced audio analysis response with detailed reporting
 */
function generateEnhancedAudioResponse(
  confidence: number, 
  isDeepfake: boolean,
  isDemo: boolean, 
  metadata: any, 
  rawApiData?: any,
  errorMessage?: string
) {
  // Calculate risk level based on confidence
  const riskLevel = getRiskLevel(confidence);
  const confidenceCategory = getConfidenceCategory(confidence);
  
  // Debug logging
  console.log(`🔍 Enhanced Audio Response Generation:`);
  console.log(`  - Confidence: ${confidence} (${(confidence * 100).toFixed(1)}%)`);
  console.log(`  - Is Deepfake: ${isDeepfake}`);
  console.log(`  - Calculated Risk Level: ${riskLevel}`);
  console.log(`  - Calculated Confidence Category: ${confidenceCategory}`);
  console.log(`  - Is Demo: ${isDemo}`);
  
  // Generate recommendations based on analysis
  const recommendations = generateRecommendations(confidence, riskLevel);
  const limitations = generateLimitations(isDemo, confidence);
  
  // Extract technical details from metadata
  const technicalAnalysis = {
    duration: metadata.duration || 'unknown',
    sampleRate: metadata.sample_rate || 'unknown',
    channels: metadata.channels || 'unknown',
    bitrate: metadata.bitrate || 'unknown'
  };

  // Simulate audio analysis for demo mode
  const audioAnalysis = isDemo ? {
    voiceCharacteristics: {
      naturalness: Math.random() * 0.5 + 0.3,
      consistency: Math.random() * 0.4 + 0.4,
      backgroundNoise: Math.random() * 0.3
    },
    syntheticIndicators: {
      artificialPatterns: Math.random() * 0.6,
      frequencyAnomalies: Math.random() * 0.5,
      temporalInconsistencies: Math.random() * 0.4
    },
    qualityMetrics: {
      clarity: Math.random() * 0.5 + 0.4,
      stability: Math.random() * 0.6 + 0.3
    }
  } : {
    voiceCharacteristics: {
      naturalness: rawApiData?.voice_characteristics?.naturalness || 0.7,
      consistency: rawApiData?.voice_characteristics?.consistency || 0.8,
      backgroundNoise: rawApiData?.voice_characteristics?.background_noise || 0.2
    },
    syntheticIndicators: {
      artificialPatterns: rawApiData?.synthetic_indicators?.artificial_patterns || 0.3,
      frequencyAnomalies: rawApiData?.synthetic_indicators?.frequency_anomalies || 0.2,
      temporalInconsistencies: rawApiData?.synthetic_indicators?.temporal_inconsistencies || 0.3
    },
    qualityMetrics: {
      clarity: rawApiData?.quality_metrics?.clarity || 0.8,
      stability: rawApiData?.quality_metrics?.stability || 0.7
    }
  };

  // Debug logging for final response
  console.log(`📤 Final Enhanced Audio Response:`);
  console.log(`  - Risk Level: ${riskLevel}`);
  console.log(`  - Confidence Category: ${confidenceCategory}`);
  console.log(`  - Analysis Quality: ${isDemo ? 'DEMO' : 'API'}`);
  console.log(`  - Recommendations count: ${recommendations.length}`);
  console.log(`  - Limitations count: ${limitations.length}`);
  
  return {
    status: 'success',
    is_synthetic: isDeepfake,
    confidence: confidence,
    metadata: metadata,
    raw_response: rawApiData,
    // Enhanced fields
    riskLevel,
    confidenceCategory,
    analysisQuality: isDemo ? 'DEMO' : 'API',
    processingDetails: {
      apiProvider: 'Resemble AI',
      modelsUsed: ['voice_synthesis_detection'],
      processingMethod: 'AI-powered audio pattern analysis',
      qualityScore: isDemo ? 0.6 : 0.9,
      confidenceFactors: [
        {
          factor: 'Voice Naturalness',
          weight: 0.4,
          description: 'Analysis of voice characteristics and natural patterns',
          impact: audioAnalysis.voiceCharacteristics.naturalness > 0.7 ? 'POSITIVE' : 'NEGATIVE'
        },
        {
          factor: 'Synthetic Indicators',
          weight: 0.4,
          description: 'Detection of artificial voice synthesis patterns',
          impact: audioAnalysis.syntheticIndicators.artificialPatterns > 0.5 ? 'NEGATIVE' : 'POSITIVE'
        },
        {
          factor: 'Audio Quality',
          weight: 0.2,
          description: 'Overall audio clarity and stability metrics',
          impact: 'NEUTRAL'
        }
      ],
      processingWarnings: errorMessage ? [errorMessage] : undefined
    },
    recommendations,
    limitations,
    audioAnalysis
  };
}

/**
 * Helper functions for enhanced analysis reporting
 */
function getRiskLevel(confidence: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  // For deepfake detection: HIGH confidence = HIGH probability of being fake = HIGH risk
  if (confidence >= 0.8) return 'CRITICAL';  // 80%+ confidence = Critical risk
  if (confidence >= 0.6) return 'HIGH';      // 60-79% confidence = High risk  
  if (confidence >= 0.4) return 'MEDIUM';    // 40-59% confidence = Medium risk
  if (confidence >= 0.2) return 'LOW';       // 20-39% confidence = Low risk
  return 'LOW';                              // 0-19% confidence = Low risk (likely authentic)
}

function getConfidenceCategory(confidence: number): 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
  // For deepfake detection: HIGH confidence = HIGH probability of being fake
  if (confidence >= 0.9) return 'VERY_HIGH';  // 90%+ confidence = Very high probability of fake
  if (confidence >= 0.7) return 'HIGH';       // 70-89% confidence = High probability of fake
  if (confidence >= 0.5) return 'MEDIUM';     // 50-69% confidence = Medium probability of fake
  if (confidence >= 0.3) return 'LOW';        // 30-49% confidence = Low probability of fake
  return 'VERY_LOW';                          // 0-29% confidence = Very low probability of fake (likely authentic)
}

function generateRecommendations(confidence: number, riskLevel: string): string[] {
  const recommendations: string[] = [];
  
  if (confidence >= 0.8) {
    recommendations.push(
      '🚨 CRITICAL: Very high probability of deepfake detected',
      'Exercise extreme caution - this media is likely manipulated',
      'Verify source and context immediately',
      'Consider additional verification methods',
      'Document findings for security purposes'
    );
  } else if (confidence >= 0.6) {
    recommendations.push(
      '⚠️ HIGH: High probability of deepfake detected',
      'Approach with extreme caution',
      'Verify media source and authenticity thoroughly',
      'Look for additional verification clues',
      'Consider professional analysis if critical'
    );
  } else if (confidence >= 0.4) {
    recommendations.push(
      '🔍 MEDIUM: Moderate manipulation indicators detected',
      'Some suspicious patterns identified',
      'Verify source and check for metadata inconsistencies',
      'Compare with known authentic versions if available',
      'Proceed with caution'
    );
  } else if (confidence >= 0.2) {
    recommendations.push(
      '✅ LOW: Minimal manipulation indicators',
      'Media appears mostly authentic',
      'Continue to verify source and context',
      'Monitor for any new detection methods'
    );
  } else {
    recommendations.push(
      '✅ VERY LOW: No significant manipulation detected',
      'Media appears authentic based on current analysis',
      'Continue to verify source and context',
      'Monitor for any new detection methods'
    );
  }
  
  return recommendations;
}

function generateLimitations(isDemo: boolean, confidence: number): string[] {
  const limitations: string[] = [];
  
  if (isDemo) {
    limitations.push(
      'Analysis performed in demo mode - results are simulated',
      'Real API credentials required for accurate detection',
      'Demo scores are randomly generated for demonstration purposes'
    );
  }
  
  if (confidence < 0.3) {
    limitations.push(
      'Low confidence score may indicate unclear or ambiguous results',
      'Consider re-analyzing with different media or higher resolution',
      'Some manipulation techniques may evade current detection methods'
    );
  }
  
  limitations.push(
    'Analysis based on current AI model capabilities',
    'New manipulation techniques may not be detected',
    'Results should be considered alongside other verification methods',
    'Professional verification recommended for critical applications'
  );
  
  return limitations;
}

/**
 * Main analysis handler
 */
export const handleAnalyze: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as AnalysisResponse);
    }

    const category = getFileCategory(req.file.mimetype);
    const filePath = req.file.path;
    const startTime = Date.now();

    let apiResponse: any;
    let analysisResult: any;

    try {
      switch (category) {
        case 'image':
          apiResponse = await analyzeImage(filePath);
          analysisResult = {
            type: 'image',
            isDeepfake: apiResponse.deepfake.prob > 0.7, // Higher threshold for more accurate detection
            confidence: apiResponse.deepfake.prob,
            analysisTime: Date.now() - startTime,
            sightengineData: apiResponse,
            metadata: apiResponse.metadata,
            // Enhanced fields - now properly extracted from enhanced response
            riskLevel: apiResponse.riskLevel,
            confidenceCategory: apiResponse.confidenceCategory,
            analysisQuality: apiResponse.analysisQuality,
            processingDetails: apiResponse.processingDetails,
            recommendations: apiResponse.recommendations,
            limitations: apiResponse.limitations,
            imageAnalysis: apiResponse.imageAnalysis
          };
          console.log(`Image Analysis Result: Score=${apiResponse.deepfake.prob}, Risk Level=${apiResponse.riskLevel}, Classification=${analysisResult.isDeepfake ? 'FAKE' : 'AUTHENTIC'}`);
          console.log(`🔍 Enhanced Fields Check:`);
          console.log(`  - Risk Level: ${apiResponse.riskLevel}`);
          console.log(`  - Recommendations: ${apiResponse.recommendations?.length || 0} items`);
          console.log(`  - Limitations: ${apiResponse.limitations?.length || 0} items`);
          console.log(`  - Processing Details: ${apiResponse.processingDetails ? 'Present' : 'Missing'}`);
          break;

        case 'video':
          apiResponse = await analyzeVideo(filePath);
          analysisResult = {
            type: 'video',
            isDeepfake: apiResponse.deepfake.prob > 0.7, // Higher threshold for more accurate detection
            confidence: apiResponse.deepfake.prob,
            analysisTime: Date.now() - startTime,
            sightengineData: apiResponse,
            metadata: apiResponse.metadata,
            // Enhanced fields - now properly extracted from enhanced response
            riskLevel: apiResponse.riskLevel,
            confidenceCategory: apiResponse.confidenceCategory,
            analysisQuality: apiResponse.analysisQuality,
            processingDetails: apiResponse.processingDetails,
            recommendations: apiResponse.recommendations,
            limitations: apiResponse.limitations,
            videoAnalysis: apiResponse.videoAnalysis
          };
          console.log(`Video Analysis Result: Score=${apiResponse.deepfake.prob}, Risk Level=${apiResponse.riskLevel}, Classification=${analysisResult.isDeepfake ? 'FAKE' : 'AUTHENTIC'}`);
          console.log(`🔍 Enhanced Video Fields Check:`);
          console.log(`  - Risk Level: ${apiResponse.riskLevel}`);
          console.log(`  - Recommendations: ${apiResponse.recommendations?.length || 0} items`);
          console.log(`  - Limitations: ${apiResponse.limitations?.length || 0} items}`);
          console.log(`  - Processing Details: ${apiResponse.processingDetails ? 'Present' : 'Missing'}`);
          if (apiResponse.detection_details?.frame_analysis) {
            console.log(`Frame Analysis: ${apiResponse.detection_details.frame_analysis.total_frames} frames, Max Score: ${apiResponse.detection_details.frame_analysis.max_score}`);
          }
          break;

        case 'audio':
          apiResponse = await analyzeAudio(filePath);
          analysisResult = {
            type: 'audio',
            isDeepfake: apiResponse.is_synthetic,
            confidence: apiResponse.confidence,
            analysisTime: Date.now() - startTime,
            resembleData: apiResponse,
            metadata: apiResponse.metadata,
            // Enhanced fields - now properly extracted from enhanced response
            riskLevel: apiResponse.riskLevel,
            confidenceCategory: apiResponse.confidenceCategory,
            analysisQuality: apiResponse.analysisQuality,
            processingDetails: apiResponse.processingDetails,
            recommendations: apiResponse.recommendations,
            limitations: apiResponse.limitations,
            audioAnalysis: apiResponse.audioAnalysis
          };
          console.log(`Audio Analysis Result: Score=${apiResponse.confidence}, Risk Level=${apiResponse.riskLevel}, Classification=${analysisResult.isDeepfake ? 'FAKE' : 'AUTHENTIC'}`);
          console.log(`🔍 Enhanced Audio Fields Check:`);
          console.log(`  - Risk Level: ${apiResponse.riskLevel}`);
          console.log(`  - Recommendations: ${apiResponse.recommendations?.length || 0} items`);
          console.log(`  - Limitations: ${apiResponse.limitations?.length || 0} items`);
          console.log(`  - Processing Details: ${apiResponse.processingDetails ? 'Present' : 'Missing'}`);
          break;

        default:
          throw new Error('Unsupported file type');
      }

      // Clean up uploaded file immediately after processing
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Temporary file cleaned up successfully');
        }
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
        // Don't fail the request due to cleanup issues
      }

      res.json({
        success: true,
        result: analysisResult
      } as AnalysisResponse);

    } catch (apiError) {
      // Clean up file on error with better error handling
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Temporary file cleaned up after error');
        }
      } catch (cleanupError) {
        console.error('File cleanup error after API failure:', cleanupError);
        // Continue with the original error
      }
      throw apiError;
    }

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed'
    } as AnalysisResponse);
  }
};
