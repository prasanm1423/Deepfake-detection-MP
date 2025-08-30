import "dotenv/config";
import express from "express";
import cors from "cors";
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

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Test API credentials
  app.get("/api/test-sightengine", testSightengineAPI);
  
  // Debug file upload endpoint
  app.post("/api/debug-upload", async (req, res) => {
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
  app.post("/api/analyze", async (req, res) => {
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

  return app;
}
