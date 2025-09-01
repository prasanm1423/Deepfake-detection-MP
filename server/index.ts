import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo.js";
import { testSightengineAPI, testResembleAPI } from "./routes/test-api.js";
import { debugFileUpload } from "./routes/analyze.js";
import { createRateLimiters } from "./utils/rateLimiter.js";

export function createServer() {
  // Environment variable verification
  console.log('=== ENVIRONMENT VARIABLE CHECK ===');
  console.log('- SIGHTENGINE_USER:', process.env.SIGHTENGINE_USER ? 'SET' : 'MISSING');
  console.log('- SIGHTENGINE_SECRET:', process.env.SIGHTENGINE_SECRET ? 'SET' : 'MISSING');
  console.log('- RESEMBLE_API_KEY:', process.env.RESEMBLE_API_KEY ? 'SET' : 'MISSING');
  console.log('- API Status:', (process.env.SIGHTENGINE_USER && process.env.SIGHTENGINE_SECRET) ? 'READY' : 'DEMO MODE');
  console.log('=====================================');

  // Create rate limiters using the enhanced utility
  const { generalLimiter, analysisLimiter, uploadLimiter, statusLimiter } = createRateLimiters();

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
         'http://localhost:8081',
         'http://127.0.0.1:3000',
         'http://127.0.0.1:5173',
         'http://127.0.0.1:8080',
         'http://127.0.0.1:8081'
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
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
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
  app.get("/api/test-resemble", testResembleAPI);
  
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
  app.get("/api/status", statusLimiter, (_req, res) => {
    res.json({
      sightengineConfigured: !!(process.env.SIGHTENGINE_USER && process.env.SIGHTENGINE_SECRET),
      resembleConfigured: !!process.env.RESEMBLE_API_KEY,
      message: "Deepfake Detection API Ready"
    });
  });

  // API rate limits status endpoint
  app.get("/api/rate-limits", statusLimiter, (_req, res) => {
    const { getRemainingAPICalls } = require("./utils/rateLimiter.js");
    
    res.json({
      sightengine: getRemainingAPICalls('sightengine'),
      resemble: getRemainingAPICalls('resemble'),
      message: "API Rate Limits Status"
    });
  });

  // Reset rate limits endpoint (for development/testing)
  app.post("/api/reset-rate-limits", (_req, res) => {
    const { resetRateLimits } = require("./utils/rateLimiter.js");
    resetRateLimits();
    res.json({
      success: true,
      message: "Rate limits reset successfully"
    });
  });

  // Serve uploaded files by filename
  app.get("/api/files/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      console.log(`[FILE_SERVE] Request for file: ${filename}`);
      console.log(`[FILE_SERVE] Full path: ${filePath}`);
      
      // Security check: prevent directory traversal
      const resolvedPath = path.resolve(filePath);
      const uploadsDir = path.resolve(path.join(process.cwd(), 'uploads'));
      
      if (!resolvedPath.startsWith(uploadsDir)) {
        console.log(`[FILE_SERVE] Access denied - path traversal attempt`);
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      
      // Check if file exists
      const fs = await import('fs');
      if (!fs.existsSync(filePath)) {
        console.log(`[FILE_SERVE] File not found: ${filePath}`);
        return res.status(404).json({ success: false, error: 'File not found' });
      }
      
      // Get file stats
      const stats = fs.statSync(filePath);
      console.log(`[FILE_SERVE] File stats: ${stats.size} bytes, modified: ${stats.mtime}`);
      
      // Set appropriate headers based on file extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.mp4') contentType = 'video/mp4';
      else if (ext === '.avi') contentType = 'video/x-msvideo';
      else if (ext === '.mov') contentType = 'video/quicktime';
      else if (ext === '.mp3') contentType = 'audio/mpeg';
      else if (ext === '.wav') contentType = 'audio/wav';
      else if (ext === '.ogg') contentType = 'audio/ogg';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      console.log(`[FILE_SERVE] Serving file: ${filePath}`);
      
      // Use createReadStream for better error handling
      const stream = fs.createReadStream(filePath);
      
      stream.on('error', (err) => {
        console.error('[FILE_SERVE] Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: 'File read error' });
        }
      });
      
      stream.on('end', () => {
        console.log(`[FILE_SERVE] Successfully served: ${filename}`);
      });
      
      stream.pipe(res);
      
    } catch (error) {
      console.error('[FILE_SERVE] Unexpected error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  });

  // List uploaded files endpoint (for debugging)
  app.get("/api/files", async (req, res) => {
    try {
      const fs = await import('fs');
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        return res.json({ success: true, files: [], message: 'No uploads directory found' });
      }
      
      const files = fs.readdirSync(uploadsDir);
      const fileList = files.map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime,
          url: `/api/files/${encodeURIComponent(file)}`
        };
      });
      
      res.json({ 
        success: true, 
        files: fileList,
        count: fileList.length
      });
    } catch (error) {
      console.error('List files error:', error);
      res.status(500).json({ success: false, error: 'Failed to list files' });
    }
  });

  // Cleanup old files endpoint (for maintenance)
  app.post("/api/cleanup-files", async (req, res) => {
    try {
      const fs = await import('fs');
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        return res.json({ success: true, message: 'No uploads directory found' });
      }
      
      const files = fs.readdirSync(uploadsDir);
      let cleanedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const ageInHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
        
        // Clean up files older than 24 hours
        if (ageInHours > 24) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }
      
      res.json({ 
        success: true, 
        message: `Cleaned up ${cleanedCount} old files`,
        cleanedCount 
      });
    } catch (error) {
      console.error('Cleanup error:', error);
      res.status(500).json({ success: false, error: 'Cleanup failed' });
    }
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
