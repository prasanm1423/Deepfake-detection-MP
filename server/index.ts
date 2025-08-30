import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { handleDemo } from "./routes/demo.js";
import { testSightengineAPI } from "./routes/test-api.js";
import { debugFileUpload } from "./routes/analyze.js";

export function createServer() {
  // Environment variable verification
  console.log('=== ENVIRONMENT VARIABLE CHECK ===');
  console.log('- SIGHTENGINE_USER:', process.env.SIGHTENGINE_USER ? 'SET' : 'MISSING');
  console.log('- SIGHTENGINE_SECRET:', process.env.SIGHTENGINE_SECRET ? 'SET' : 'MISSING');
  console.log('- RESEMBLE_API_KEY:', process.env.RESEMBLE_API_KEY ? 'SET' : 'MISSING');
  console.log('- API Status:', (process.env.SIGHTENGINE_USER && process.env.SIGHTENGINE_SECRET) ? 'READY' : 'DEMO MODE');
  console.log('=====================================');

  // Rate limiting configuration
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(15 * 60 / 1000) // minutes
      });
    }
  });

  // Stricter rate limiting for analysis endpoints
  const analysisLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 analysis requests per 15 minutes
    message: {
      error: 'Analysis rate limit exceeded. Please wait before uploading more files.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Analysis rate limit exceeded',
        message: 'You have exceeded the analysis limit. Please wait before uploading more files.',
        retryAfter: Math.ceil(15 * 60 / 1000)
      });
    }
  });

  // File upload rate limiting (more restrictive)
  const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 file uploads per 15 minutes
    message: {
      error: 'Upload rate limit exceeded. Please wait before uploading more files.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Upload rate limit exceeded',
        message: 'You have exceeded the upload limit. Please wait before uploading more files.',
        retryAfter: Math.ceil(15 * 60 / 1000)
      });
    }
  });

  const app = express();

  // Secure CORS configuration
  const corsOptions = {
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log('Request with no origin - allowing');
        return callback(null, true);
      }
      
      // Allow localhost and your domain
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080'
      ];
      
      if (allowedOrigins.includes(origin)) {
        console.log('Origin allowed:', origin);
        callback(null, true);
      } else {
        console.log('Origin blocked:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // Don't allow credentials for security
    maxAge: 86400 // Cache preflight for 24 hours
  };
  
  // Apply CORS only to API routes, not to Vite dev server routes
  app.use('/api', cors(corsOptions));
  
  // Allow all origins for Vite dev server routes (hot reload, etc.)
  app.use(cors({
    origin: true,
    credentials: false
  }));
  
  // Middleware
  app.use(express.json({ limit: '10mb' })); // Reduced from 50mb for security
  app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Reduced from 50mb for security
  
  // Apply general rate limiting to all routes
  app.use(generalLimiter);
  
  // Security headers middleware
  app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    // Log security-relevant requests
    if (req.method === 'POST' && (req.path.includes('/analyze') || req.path.includes('/upload'))) {
      console.log(`[SECURITY] ${req.method} ${req.path} from ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
    }
    
    next();
  });

  // Request validation middleware
  app.use((req, res, next) => {
    // Validate request method
    const allowedMethods = ['GET', 'POST', 'OPTIONS'];
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: `HTTP method ${req.method} is not supported`
      });
    }

    // Validate content length for POST requests
    if (req.method === 'POST' && req.headers['content-length']) {
      const contentLength = parseInt(req.headers['content-length']);
      if (contentLength > 10 * 1024 * 1024) { // 10MB
        return res.status(413).json({
          success: false,
          error: 'Payload too large',
          message: 'Request body exceeds 10MB limit'
        });
      }
    }

    // Block suspicious User-Agent strings
    const userAgent = req.get('User-Agent') || '';
    const suspiciousPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /java/i,
      /sqlmap/i, /nikto/i, /nmap/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      console.log(`[SECURITY] Suspicious User-Agent blocked: ${userAgent}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Request blocked for security reasons'
      });
    }

    next();
  });

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Test API credentials
  app.get("/api/test-sightengine", testSightengineAPI);
  
  // Debug file upload endpoint
  app.post("/api/debug-upload", uploadLimiter, async (req, res) => {
    try {
      const { upload } = await import("./routes/analyze.js");
      upload.single('file')(req, res, (err: any) => {
        if (err) {
          return res.status(400).json({ success: false, error: err.message });
        }
        debugFileUpload(req, res, () => {});
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Debug service unavailable' });
    }
  });

  // Deepfake analysis routes - lazy load to avoid multer import at startup
  app.post("/api/analyze", analysisLimiter, async (req, res) => {
    try {
      const { handleAnalyze, upload } = await import("./routes/analyze.js");
      upload.single('file')(req, res, (err: any) => {
        if (err) {
          return res.status(400).json({ success: false, error: err.message });
        }
        handleAnalyze(req, res, () => {});
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Analysis service unavailable' });
    }
  });

  // Environment status endpoint for frontend to check API key configuration
  app.get("/api/status", (_req, res) => {
    res.json({
      sightengineConfigured: !!(process.env.SIGHTENGINE_USER && process.env.SIGHTENGINE_SECRET),
      resembleConfigured: !!process.env.RESEMBLE_API_KEY,
      message: "Deepfake Detection API Ready"
    });
  });

  // Global error handler for security and validation errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);

    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({
        success: false,
        error: 'CORS policy violation',
        message: 'Origin not allowed by CORS policy'
      });
    }

    // Handle rate limiting errors
    if (err.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: err.message || 'Too many requests'
      });
    }

    // Handle validation errors
    if (err.status === 400 || err.status === 413) {
      return res.status(err.status).json({
        success: false,
        error: 'Validation error',
        message: err.message || 'Invalid request'
      });
    }

    // Handle method not allowed
    if (err.status === 405) {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        message: err.message || 'HTTP method not supported'
      });
    }

    // Generic error response (don't leak internal details)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  });

  return app;
}
