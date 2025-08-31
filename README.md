# 🛡️ DeepGuard - AI-Powered Deepfake Detection Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

> **Advanced AI-powered security system designed to detect and analyze manipulated media content including deepfakes, AI-generated images, and synthetic voice content.**

## 🌟 Overview

DeepGuard is a comprehensive deepfake detection platform that leverages cutting-edge AI technology to protect against digital deception. In today's digital age where sophisticated AI can create convincing fake media, DeepGuard serves as a critical defense mechanism for media verification, content moderation, security assessment, and digital forensics.

### 🎯 Key Capabilities
- **🖼️ Image Analysis**: Detect face-swap deepfakes and AI-generated images
- **🎬 Video Analysis**: Frame-by-frame deepfake detection in videos
- **🎵 Audio Analysis**: Identify synthetic/cloned voices
- **📱 Real-time Processing**: Live camera capture and instant analysis
- **🔄 Batch Processing**: Handle multiple files efficiently
- **📊 Detailed Reports**: Comprehensive analysis with confidence scores

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **pnpm** (recommended) or npm
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/deepguard.git
cd deepguard

# 2. Install dependencies
pnpm install

# 3. Setup environment (Choose one)
# Option A: Use setup script (recommended)
./setup.sh          # Linux/Mac
setup.bat           # Windows

# Option B: Manual setup
cp .env.example .env

# 4. Start development server
pnpm dev
```

Visit **http://localhost:8080** to access the application! 🎉

## ⚙️ Configuration

### Environment Setup

The application works in **demo mode** without API keys, but for real detection capabilities:

1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Configure API keys** (optional):
   ```env
   # Sightengine API (Image & Video Analysis)
   SIGHTENGINE_USER=your_sightengine_user_id
   SIGHTENGINE_SECRET=your_sightengine_secret

   # Resemble AI API (Audio Analysis)
   RESEMBLE_API_KEY=your_resemble_api_key
   ```

### API Keys Setup

#### 🌐 Sightengine API (Image & Video Analysis)
1. Visit [https://sightengine.com/](https://sightengine.com/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your **User ID** and **Secret**

#### 🎵 Resemble AI API (Audio Analysis)
1. Visit [https://www.resemble.ai/detect/](https://www.resemble.ai/detect/)
2. Sign up for an account
3. Navigate to API section
4. Generate and copy your **API key**

## 🎨 Features

### 🔍 Advanced Detection Capabilities

#### **Image Analysis**
- **Face-swap Detection**: Identifies manipulated facial features and expressions
- **AI-Generated Content Detection**: Recognizes images created by AI tools like Stable Diffusion, DALL-E
- **Metadata Analysis**: Examines technical properties and manipulation signatures
- **Compression Artifact Detection**: Identifies signs of image manipulation

#### **Video Analysis**
- **Frame-by-Frame Processing**: Analyzes each frame for deepfake indicators
- **Temporal Consistency**: Detects inconsistencies across video frames
- **Motion Pattern Analysis**: Identifies unnatural movement patterns
- **Audio-Visual Synchronization**: Checks for mismatched audio and video

#### **Audio Analysis**
- **Voice Cloning Detection**: Identifies artificially generated speech
- **Speaker Verification**: Analyzes vocal patterns and authenticity markers
- **Audio Fingerprinting**: Detects signs of audio manipulation
- **Emotion Stability Analysis**: Checks for unnatural emotional patterns

### 🎯 User Interface Features

#### **Modern Dashboard**
- **Real-time Statistics**: Live updating analytics with visual progress indicators
- **Professional Dark Theme**: Beautiful purple-gradient design with glass morphism effects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

#### **File Upload Interface**
- **Drag & Drop Support**: Intuitive file handling with visual feedback
- **Multi-format Support**: Comprehensive support for images, videos, and audio
- **Progress Tracking**: Real-time upload and analysis progress indicators
- **File Validation**: Automatic type checking and size limits (10MB max)

#### **Live Camera Capture**
- **Photo Capture**: Instant camera snapshots for immediate deepfake analysis
- **Video Recording**: Short video capture with recording timer and controls
- **Real-time Preview**: Live camera feed with professional UI controls

#### **Results Dashboard**
- **Analysis Cards**: Detailed breakdown of each detection result
- **Confidence Visualization**: Progress bars and color-coded threat levels
- **Technical Details**: Expandable sections showing API responses and metadata
- **Export Options**: Results can be saved and shared for documentation

### 🛡️ Security Features

#### **Rate Limiting**
- **API Protection**: Prevents abuse and manages API quotas
- **User Limits**: Configurable limits based on subscription tiers
- **Exponential Backoff**: Automatic retry with intelligent delays
- **Graceful Fallbacks**: Falls back to demo mode during outages

#### **Data Protection**
- **Secure File Handling**: Temporary file storage with automatic cleanup
- **Environment Variables**: Secure API key management
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive file and data validation

## 🏗️ Architecture

### **Frontend (React + TypeScript)**
- **React 18**: Latest React features with concurrent rendering
- **TypeScript**: Type-safe development with enhanced IDE support
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Radix UI**: Accessible, unstyled UI components
- **React Router**: Client-side routing with SPA architecture

### **Backend (Node.js + Express)**
- **Express.js**: Fast, unopinionated web framework
- **TypeScript**: Type-safe server-side development
- **Multer**: File upload handling with validation
- **Axios**: HTTP client for API integrations
- **Rate Limiting**: Built-in protection against abuse
- **CORS**: Cross-origin resource sharing configuration

### **AI Integration**
- **Sightengine API**: Advanced image and video analysis
- **Resemble AI**: State-of-the-art audio deepfake detection
- **Error Handling**: Robust error management and fallbacks
- **Response Processing**: Intelligent result interpretation and formatting

### **Database (Supabase)**
- **PostgreSQL**: Robust relational database
- **Row Level Security**: Data protection and user isolation
- **Real-time Updates**: Live data synchronization
- **User Management**: Authentication and authorization

## 📁 Project Structure

```
deepguard/
├── 📁 client/                 # React frontend application
│   ├── 📁 components/         # Reusable UI components
│   │   ├── 📁 ui/            # Base UI components (Radix UI)
│   │   ├── FileUpload.tsx    # File upload interface
│   │   ├── CameraCapture.tsx # Live camera capture
│   │   ├── ResultsDashboard.tsx # Analysis results display
│   │   └── SetupGuide.tsx    # Configuration helper
│   ├── 📁 pages/             # Route components
│   │   ├── Index.tsx         # Main dashboard
│   │   ├── AnalysisResults.tsx # Results page
│   │   ├── AnalysisHistory.tsx # History page
│   │   ├── Login.tsx         # Authentication
│   │   ├── Signup.tsx        # User registration
│   │   ├── Dashboard.tsx     # User dashboard
│   │   ├── Landing.tsx       # Marketing page
│   │   ├── Pricing.tsx       # Pricing information
│   │   └── NotFound.tsx      # 404 page
│   ├── 📁 contexts/          # React contexts
│   │   └── AuthContext.tsx   # Authentication state
│   ├── 📁 hooks/             # Custom React hooks
│   ├── 📁 lib/               # Utility libraries
│   │   └── supabase.ts       # Database client
│   └── global.css            # Global styles
├── 📁 server/                # Express backend
│   ├── 📁 routes/            # API route handlers
│   │   ├── analyze.ts        # Analysis endpoints
│   │   ├── demo.ts           # Demo mode handlers
│   │   └── test-api.ts       # API testing endpoints
│   ├── 📁 utils/             # Server utilities
│   │   └── rateLimiter.ts    # Rate limiting logic
│   └── index.ts              # Server entry point
├── 📁 shared/                # Shared utilities
│   └── api.ts                # Shared API types
├── 📁 public/                # Static assets
├── 📁 uploads/               # Temporary file storage
├── .env.example              # Environment template
├── setup.sh                  # Linux/Mac setup script
├── setup.bat                 # Windows setup script
├── database_schema.sql       # Database schema
└── README.md                 # This file
```

## 🎯 Usage Guide

### **Getting Started**

1. **Upload Files**: Drag & drop or click to upload images, videos, or audio files
2. **Live Capture**: Use the camera tab for real-time photo/video capture
3. **Analysis**: Watch real-time progress as files are processed
4. **Results**: Review detailed analysis with confidence scores and recommendations
5. **History**: Access past analyses in the dashboard

### **Supported File Formats**

#### **Images**
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)
- **Maximum Size**: 10MB

#### **Videos**
- **MP4** (.mp4)
- **WebM** (.webm)
- **MOV** (.mov)
- **Maximum Size**: 10MB
- **Duration**: Up to 30 seconds

#### **Audio**
- **WAV** (.wav)
- **MP3** (.mp3)
- **M4A** (.m4a)
- **OGG** (.ogg)
- **Maximum Size**: 10MB

### **Analysis Results**

#### **Confidence Scoring**
- **0-20%**: Very Low Confidence
- **21-40%**: Low Confidence
- **41-60%**: Medium Confidence
- **61-80%**: High Confidence
- **81-100%**: Very High Confidence

#### **Risk Levels**
- **🟢 LOW**: Likely authentic content
- **🟡 MEDIUM**: Some suspicious indicators
- **🟠 HIGH**: Multiple manipulation signs
- **🔴 CRITICAL**: High probability of deepfake

## 🎭 Demo Mode

Without API keys, the application runs in **demo mode** with:
- **Mock Responses**: Realistic analysis results for testing
- **Sample Data**: Pre-configured examples to explore features
- **Full Functionality**: Complete UI and workflow testing
- **No API Costs**: Free testing without external API calls

## 🔧 Development

### **Available Scripts**

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm typecheck    # TypeScript validation
pnpm test         # Run tests
pnpm format.fix   # Format code with Prettier
```

### **Environment Variables**

```env
# Frontend (Vite exposes VITE_* to browser)
VITE_PUBLIC_BUILDER_KEY=YOUR_BUILDER_PUBLIC_KEY
PING_MESSAGE=ping

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API Keys (Required for real detection)
SIGHTENGINE_USER=your_sightengine_user_id
SIGHTENGINE_SECRET=your_sightengine_secret
RESEMBLE_API_KEY=your_resemble_api_key
```

### **API Endpoints**

#### **Analysis Endpoints**
- `POST /api/analyze` - Analyze uploaded files
- `GET /api/status` - Check API configuration status
- `GET /api/rate-limits` - View rate limit information

#### **Testing Endpoints**
- `GET /api/test-sightengine` - Test Sightengine API
- `GET /api/test-resemble` - Test Resemble AI API
- `GET /api/demo` - Demo mode responses

## 🛡️ Security Considerations

### **Data Privacy**
- **No Data Storage**: Uploaded files are processed and immediately deleted
- **Temporary Storage**: Files stored only during analysis
- **Secure Transmission**: HTTPS encryption for all data transfer
- **API Key Protection**: Environment variables for sensitive credentials

### **Rate Limiting**
- **General Requests**: 100 per 15 minutes
- **Analysis Requests**: 15 per 15 minutes
- **File Uploads**: 8 per 15 minutes
- **Status Checks**: 30 per 5 minutes

### **Error Handling**
- **Graceful Degradation**: Falls back to demo mode on API failures
- **User-Friendly Messages**: Clear error explanations
- **Retry Logic**: Automatic retry with exponential backoff
- **Logging**: Comprehensive error logging for debugging

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Setup**

```bash
# 1. Fork and clone the repository
git clone https://github.com/yourusername/deepguard.git
cd deepguard

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env

# 4. Start development server
pnpm dev
```

### **Code Style**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

## 📊 Performance

### **Optimizations**
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Compressed file uploads
- **Caching**: Intelligent response caching
- **Bundle Splitting**: Optimized JavaScript bundles

### **Monitoring**
- **Real-time Metrics**: Live performance monitoring
- **Error Tracking**: Comprehensive error reporting
- **Usage Analytics**: User behavior insights
- **API Monitoring**: External service health checks

## 🚀 Deployment

### **Production Build**

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### **Environment Setup**
- **Node.js**: 18+ required
- **Memory**: Minimum 512MB RAM
- **Storage**: 1GB available space
- **Network**: Stable internet connection for API calls

### **Deployment Options**
- **Vercel**: Easy deployment with Vercel CLI
- **Netlify**: Simple drag-and-drop deployment
- **Docker**: Containerized deployment
- **Self-hosted**: Traditional server deployment

## 📈 Roadmap

### **Upcoming Features**
- [ ] **Batch Processing**: Analyze multiple files simultaneously
- [ ] **API Integration**: Support for additional AI providers
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Enterprise Features**: Advanced analytics and reporting
- [ ] **Real-time Collaboration**: Team-based analysis workflows
- [ ] **Custom Models**: User-trained detection models

### **Enhancements**
- [ ] **Performance Optimization**: Faster analysis processing
- [ ] **UI Improvements**: Enhanced user experience
- [ ] **Security Hardening**: Additional security measures
- [ ] **Documentation**: Comprehensive API documentation
- [ ] **Testing**: Expanded test coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Sightengine**: Advanced image and video analysis capabilities
- **Resemble AI**: State-of-the-art audio deepfake detection
- **Supabase**: Backend-as-a-Service platform
- **React Team**: Amazing frontend framework
- **Vite Team**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework

## 📞 Support

### **Getting Help**
- **Documentation**: Check our [documentation](docs/)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/deepguard/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/yourusername/deepguard/discussions)
- **Email**: Contact us at support@deepguard.ai

### **Community**
- **Discord**: Join our [Discord server](https://discord.gg/deepguard)
- **Twitter**: Follow us [@DeepGuardAI](https://twitter.com/DeepGuardAI)
- **Blog**: Read our [blog](https://blog.deepguard.ai)

---

<div align="center">

**Made with ❤️ by the DeepGuard Team**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/deepguard?style=social)](https://github.com/yourusername/deepguard/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/deepguard?style=social)](https://github.com/yourusername/deepguard/network)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/deepguard)](https://github.com/yourusername/deepguard/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/deepguard)](https://github.com/yourusername/deepguard/pulls)

</div>