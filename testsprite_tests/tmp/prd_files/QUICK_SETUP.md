# Quick API Setup Guide

## Option 1: Automated Setup (Recommended)

Run the setup script:
```bash
node setup-api.js
```

This will guide you through entering your API credentials interactively.

## Option 2: Manual Setup

1. **Create a `.env` file** in the project root directory
2. **Add your API credentials** to the file:

```env
# Sightengine API (Image & Video Analysis)
SIGHTENGINE_USER=your_sightengine_user_id_here
SIGHTENGINE_SECRET=your_sightengine_secret_here

# Resemble AI Detect API (Audio Analysis)
RESEMBLE_API_KEY=your_resemble_api_key_here
```

## Getting API Keys

### 🌐 Sightengine API
1. Visit: https://sightengine.com/
2. Sign up for a free account
3. Go to your dashboard
4. Copy your **User ID** and **Secret**

### 🎵 Resemble AI Detect API
1. Visit: https://www.resemble.ai/detect/
2. Sign up for an account
3. Navigate to API section
4. Generate and copy your **API key**

## Verification

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

## Troubleshooting

- **"MISSING" status**: Check that your `.env` file is in the project root
- **"DEMO MODE"**: API credentials not properly configured
- **API errors**: Verify your credentials are correct and you have sufficient API credits
