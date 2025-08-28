import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { testSightengineAPI } from "./routes/test-api.js";

export function createServer() {
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
