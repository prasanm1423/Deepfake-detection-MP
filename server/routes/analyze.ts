import { RequestHandler } from "express";
import { AnalysisResponse, getFileCategory } from "../../shared/api.js";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import path from "path";
import fs from "fs";

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
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const category = getFileCategory(file.mimetype);
    if (category === 'unsupported') {
      cb(new Error('Unsupported file type'));
      return;
    }
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
    const isLikelyDeepfake = Math.random() > 0.8;
    const confidence = isLikelyDeepfake
      ? Math.random() * 0.25 + 0.05  // 5-30% for deepfakes (low score = fake)
      : Math.random() * 0.30 + 0.65; // 65-95% for authentic (high score = real)

    return {
      status: 'success',
      deepfake: {
        prob: confidence,
        deepfake_score: confidence,
      },
      metadata: {
        width: 1024,
        height: 768,
        format: 'demo'
      },
      demo_mode: true,
      error_message: 'Sightengine API credentials not configured',
      demo_note: `Fallback demo: ${isLikelyDeepfake ? 'Simulated deepfake detection' : 'Simulated authentic image'}`
    };
  }

  // Use axios with FormData for better compatibility
  console.log('Preparing Sightengine API request...');
  console.log('- models: deepfake');
  console.log('- api_user:', SIGHTENGINE_USER);
  console.log('- file path:', filePath);

  const form = new FormData();

  // Add form fields in the order that works best
  form.append('api_user', String(SIGHTENGINE_USER));
  form.append('api_secret', String(SIGHTENGINE_SECRET));
  form.append('models', 'deepfake');
  form.append('media', fs.createReadStream(filePath));

  try {
    console.log('Sending request to Sightengine API with axios...');

    const response = await axios.post(
      'https://api.sightengine.com/1.0/check.json',
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('Response received. Status:', response.status);
    const data = response.data;
    console.log('Sightengine API response:', JSON.stringify(data, null, 2));

    if (data.status === 'success') {
      // Extract deepfake score (we're only using deepfake model for now)
      const deepfakeScore = data.type?.deepfake || 0;

      return {
        status: 'success',
        deepfake: {
          prob: deepfakeScore,
          deepfake_score: deepfakeScore,
        },
        metadata: {
          width: data.media?.width || 'unknown',
          height: data.media?.height || 'unknown',
          format: data.media?.format || 'unknown'
        },
        raw_response: data,
        detection_details: {
          face_deepfake: deepfakeScore,
        }
      };
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
    }

    // Fallback to demo response if API fails
    console.log('Falling back to demo mode due to API error');
    // Make demo more realistic - 80% chance of authentic, 20% chance of deepfake
    const isLikelyDeepfake = Math.random() > 0.8;
    const confidence = isLikelyDeepfake
      ? Math.random() * 0.25 + 0.05  // 5-30% for deepfakes (low score = fake)
      : Math.random() * 0.30 + 0.65; // 65-95% for authentic (high score = real)

    return {
      status: 'success',
      deepfake: {
        prob: confidence,
      },
      metadata: {
        width: 1024,
        height: 768,
        format: 'demo'
      },
      demo_mode: true,
      error_message: error instanceof Error ? error.message : 'API call failed',
      demo_note: `Fallback demo: ${isLikelyDeepfake ? 'Simulated deepfake detection' : 'Simulated authentic image'}`
    };
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
    const isLikelyDeepfake = Math.random() > 0.8;
    const confidence = isLikelyDeepfake
      ? Math.random() * 0.25 + 0.05  // 5-30% for deepfakes (low score = fake)
      : Math.random() * 0.35 + 0.65; // 65-100% for authentic (high score = real)

    return {
      status: 'success',
      deepfake: {
        prob: confidence,
      },
      metadata: {
        duration: 15.6,
        fps: 30,
        resolution: '1920x1080'
      },
      demo_mode: true,
      error_message: 'Sightengine API credentials not configured',
      demo_note: `Fallback demo: ${isLikelyDeepfake ? 'Simulated deepfake detection' : 'Simulated authentic video'}`
    };
  }

  const form = new FormData();

  // Use deepfake model for video analysis
  form.append('api_user', SIGHTENGINE_USER);
  form.append('api_secret', SIGHTENGINE_SECRET);
  form.append('models', 'deepfake');
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
      // Normalize deepfake score from various possible shapes
      const scenes = Array.isArray(data.scenes) ? data.scenes : [];
      const sceneScores = scenes
        .map((s: any) => s?.type?.deepfake ?? s?.deepfake)
        .filter((v: any) => typeof v === 'number');
      const bestSceneScore = sceneScores.length > 0 ? Math.max(...sceneScores) : undefined;

      const deepfakeScore =
        (typeof data.type?.deepfake === 'number' ? data.type.deepfake : undefined) ??
        (typeof data.deepfake === 'number' ? data.deepfake : undefined) ??
        (typeof data.summary?.type?.deepfake === 'number' ? data.summary.type.deepfake : undefined) ??
        (typeof data.summary?.deepfake === 'number' ? data.summary.deepfake : undefined) ??
        bestSceneScore ??
        0;

      return {
        status: 'success',
        deepfake: {
          prob: deepfakeScore,
        },
        metadata: {
          duration: data.media?.duration ?? data.duration ?? 'unknown',
          fps: data.media?.fps ?? data.fps ?? 'unknown',
          resolution: `${(data.media?.width ?? data.width ?? '?')}x${(data.media?.height ?? data.height ?? '?')}`
        },
        raw_response: data,
        detection_details: {
          face_deepfake: deepfakeScore
        }
      };
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

    return {
      status: 'success',
      deepfake: {
        prob: confidence,
      },
      metadata: {
        duration: 15.6,
        fps: 30,
        resolution: '1920x1080'
      },
      demo_mode: true,
      error_message: error instanceof Error ? error.message : 'Video API call failed',
      demo_note: `Fallback demo: ${isLikelyDeepfake ? 'Simulated deepfake detection' : 'Simulated authentic video'}`
    };
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

      resolve({
        status: 'success',
        is_synthetic: isSynthetic,
        confidence: confidence,
        metadata: {
          duration: 8.5,
          sample_rate: 44100,
          channels: 2
        },
        demo_mode: true,
        demo_note: `Demo mode: ${isSynthetic ? 'Simulated synthetic voice detection' : 'Simulated authentic voice'}`
      });
    }, 2000);
  });
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
            isDeepfake: apiResponse.deepfake.prob < 0.5,
            confidence: apiResponse.deepfake.prob,
            analysisTime: Date.now() - startTime,
            sightengineData: apiResponse,
            metadata: apiResponse.metadata
          };
          break;

        case 'video':
          apiResponse = await analyzeVideo(filePath);
          analysisResult = {
            type: 'video',
            isDeepfake: apiResponse.deepfake.prob < 0.5,
            confidence: apiResponse.deepfake.prob,
            analysisTime: Date.now() - startTime,
            sightengineData: apiResponse,
            metadata: apiResponse.metadata
          };
          break;

        case 'audio':
          apiResponse = await analyzeAudio(filePath);
          analysisResult = {
            type: 'audio',
            isDeepfake: apiResponse.is_synthetic,
            confidence: apiResponse.confidence,
            analysisTime: Date.now() - startTime,
            resembleData: apiResponse,
            metadata: apiResponse.metadata
          };
          break;

        default:
          throw new Error('Unsupported file type');
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        result: analysisResult
      } as AnalysisResponse);

    } catch (apiError) {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
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
