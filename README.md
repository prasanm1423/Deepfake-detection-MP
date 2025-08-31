# DeepGuard - Deepfake Detection Platform

A comprehensive deepfake detection platform that analyzes images, videos, and audio files using advanced AI APIs.

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd Deepfake-detection-MP
pnpm install
```

### 2. Configure API Keys (Optional)
The app works in demo mode without API keys, but for real detection:

```bash
# Use setup script (recommended)
./setup.sh          # Linux/Mac
setup.bat           # Windows

# Or manually copy
cp .env.example .env

# Edit .env and add your API keys:
# - Sightengine API (https://sightengine.com/) for image/video analysis
# - Resemble AI API (https://www.resemble.ai/detect/) for audio analysis
```

### 3. Start Development Server
```bash
pnpm dev
```

Visit `http://localhost:8080` to use the application!

## 🔧 API Setup (Optional)

### Sightengine API (Image & Video Analysis)
1. Visit [https://sightengine.com/](https://sightengine.com/)
2. Sign up for a free account
3. Copy your User ID and Secret from the dashboard
4. Add to `.env`:
   ```
   SIGHTENGINE_USER=your_user_id
   SIGHTENGINE_SECRET=your_secret
   ```

### Resemble AI API (Audio Analysis)
1. Visit [https://www.resemble.ai/detect/](https://www.resemble.ai/detect/)
2. Sign up for an account
3. Generate an API key
4. Add to `.env`:
   ```
   RESEMBLE_API_KEY=your_api_key
   ```

## 🎯 Features

- **Image Analysis**: Detect deepfakes in images
- **Video Analysis**: Analyze video files frame by frame
- **Audio Analysis**: Detect synthetic/cloned voices
- **Real-time Processing**: Fast analysis with progress indicators
- **Demo Mode**: Test the interface without API keys
- **Rate Limiting**: Built-in protection against abuse
- **Modern UI**: Beautiful, responsive interface

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **UI**: Tailwind CSS + Radix UI
- **APIs**: Sightengine, Resemble AI
- **Database**: Supabase (PostgreSQL)

## 📁 Project Structure

```
Deepfake-detection-MP/
├── client/                 # React frontend
├── server/                # Express backend
├── shared/                # Shared utilities
├── .env.example          # Environment template
├── setup.sh              # Quick setup script (Linux/Mac)
├── setup.bat             # Quick setup script (Windows)
└── README.md             # This file
```

## 🔍 Usage

1. **Upload Files**: Drag & drop or click to upload images, videos, or audio
2. **Real-time Analysis**: Watch progress as files are processed
3. **Detailed Results**: Get confidence scores, risk levels, and recommendations
4. **History**: View past analyses in the dashboard

## 🚨 Demo Mode

Without API keys, the app runs in demo mode with:
- Mock responses for testing
- Sample data to explore features
- Full UI functionality

## 📝 License

MIT License - see LICENSE file for details.