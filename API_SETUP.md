# DeepGuard API Setup Instructions

DeepGuard uses external APIs for deepfake detection. To fully enable the detection capabilities, you need to configure API keys for the following services:

## Required API Keys

### 1. Sightengine API (Image & Video Analysis)
- **Website**: https://sightengine.com/
- **Purpose**: Detects deepfakes in images and videos
- **Required Environment Variables**:
  - `SIGHTENGINE_USER` - Your Sightengine user ID
  - `SIGHTENGINE_SECRET` - Your Sightengine API secret

### 2. Resemble AI Detect API (Audio Analysis)  
- **Website**: https://www.resemble.ai/detect/
- **Purpose**: Detects synthetic/cloned voices in audio files
- **Required Environment Variable**:
  - `RESEMBLE_API_KEY` - Your Resemble AI API key

## Setting Environment Variables

### Option 1: Using DevServerControl Tool (Recommended)
The preferred method is to use the DevServerControl tool to set environment variables securely:

1. Use the DevServerControl tool in the chat
2. Set each variable using: `set_env_variable: ["VARIABLE_NAME", "your_api_key"]`

### Option 2: Manual .env File (Not Recommended for Production)
Create a `.env` file in the project root:

\`\`\`bash
# Sightengine API credentials
SIGHTENGINE_USER=your_sightengine_user_id
SIGHTENGINE_SECRET=your_sightengine_secret

# Resemble AI API key
RESEMBLE_API_KEY=your_resemble_api_key
\`\`\`

## Demo Mode
Currently, the application runs in demo mode with mock responses when API keys are not configured. This allows you to test the interface and functionality before setting up the actual APIs.

## API Status
The application shows the configuration status in the header badges:
- 🟢 Green badge = API configured and ready
- 🔴 Red badge = API not configured

## Getting API Keys

### Sightengine Setup:
1. Visit https://sightengine.com/
2. Sign up for an account
3. Navigate to your dashboard
4. Copy your User ID and Secret

### Resemble AI Setup:
1. Visit https://www.resemble.ai/detect/
2. Sign up for an account  
3. Navigate to your API section
4. Generate and copy your API key

## Testing
Once configured, you can test the APIs using the following endpoints:

### Test API Credentials:
- **Sightengine**: `GET /api/test-sightengine` - Tests image/video analysis API
- **Resemble AI**: `GET /api/test-resemble` - Tests audio analysis API

### Test with Media Files:
Upload test media files to verify the APIs are working correctly. The application will show real detection results instead of demo responses.
