# Quick Setup Guide

## 🚀 Simple Setup (Recommended)

### Option 1: Copy .env.example (Easiest)
```bash
# 1. Copy the example environment file
cp .env.example .env

# 2. Edit .env and replace placeholder values with your API keys
# 3. Start the development server
pnpm dev
```



## 🔑 Getting API Keys

### 🌐 Sightengine API (Image & Video Analysis)
1. Visit: https://sightengine.com/
2. Sign up for a free account
3. Go to your dashboard
4. Copy your **User ID** and **Secret**

### 🎵 Resemble AI Detect API (Audio Analysis)
1. Visit: https://www.resemble.ai/detect/
2. Sign up for an account
3. Navigate to API section
4. Generate and copy your **API key**

## 📝 Environment File Structure

Your `.env` file should look like this:

```env
# Frontend (Vite exposes VITE_* to the browser)
VITE_PUBLIC_BUILDER_KEY=YOUR_BUILDER_PUBLIC_KEY
PING_MESSAGE=ping

# Supabase Configuration (Already configured)
VITE_SUPABASE_URL=https://mlkpqorzqxdgitwzwkki.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sa3Bxb3J6cXhkZ2l0d3p3a2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NDE2MzAsImV4cCI6MjA3MTUxNzYzMH0.LTBq5LNS_TiYSJzn5d78VRnppiz50KoE-BeFgZnvxZc

# Backend API Keys (Required for real deepfake detection)
SIGHTENGINE_USER=your_sightengine_user_id_here
SIGHTENGINE_SECRET=your_sightengine_secret_here
RESEMBLE_API_KEY=your_resemble_api_key_here
```

## ✅ Verification

After setting up your credentials:

1. **Restart the development server**:
   ```bash
   pnpm dev
   ```

2. **Check the console output** - you should see:
   ```
   === ENVIRONMENT VARIABLE CHECK ===
   - SIGHTENGINE_USER: SET
   - SIGHTENGINE_SECRET: SET
   - RESEMBLE_API_KEY: SET
   - API Status: READY
   ```

3. **Test with an image** - upload a test image and you should get real analysis results instead of demo data.

## 🚨 Demo Mode

If you don't configure API keys, the app will run in demo mode with:
- Mock responses for testing
- Sample data to explore features
- Full UI functionality

## 🔧 Troubleshooting

- **"MISSING" status**: Check that your `.env` file is in the project root
- **"DEMO MODE"**: API credentials not properly configured
- **API errors**: Verify your credentials are correct and you have sufficient API credits
- **File upload issues**: Check file size limits (10MB max)
