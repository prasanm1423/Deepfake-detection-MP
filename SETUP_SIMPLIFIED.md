# Simplified Setup Guide

## 🎯 The Problem
Previously, users had to run an interactive setup script every time they cloned the repo, which was:
- Time-consuming
- Required interactive input
- Not user-friendly for quick setup

## ✅ The Solution
Now users can get started with just **3 simple steps**:

### 🚀 Quick Start (3 Steps)

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd Deepfake-detection-MP
   pnpm install
   ```

2. **Run setup script** (Choose one)
   ```bash
   # Windows
   setup.bat
   
   # Linux/Mac
   ./setup.sh
   
   # Or manually
   cp .env.example .env
   ```

3. **Start the app**
   ```bash
   pnpm dev
   ```

That's it! 🎉

## 🔑 Adding API Keys (Optional)

The app works in **demo mode** without API keys, but for real detection:

1. **Edit `.env` file** and replace placeholder values:
   ```env
   SIGHTENGINE_USER=your_actual_user_id
   SIGHTENGINE_SECRET=your_actual_secret
   RESEMBLE_API_KEY=your_actual_api_key
   ```

2. **Get API keys**:
   - **Sightengine**: https://sightengine.com/ (free tier available)
   - **Resemble AI**: https://www.resemble.ai/detect/

3. **Restart the server**: `pnpm dev`

## 🎯 Benefits of New Setup

### ✅ **Faster Setup**
- No interactive prompts
- No need to remember API keys during setup
- Works offline

### ✅ **Better UX**
- Clear instructions in setup scripts
- Preserves existing `.env` files
- Cross-platform support (Windows/Linux/Mac)

### ✅ **Flexible**
- Can add API keys later
- Demo mode works immediately
- No breaking changes

## 📁 Files Added

- `setup.sh` - Linux/Mac setup script
- `setup.bat` - Windows setup script  
- Updated `.env.example` with better instructions
- Updated `README.md` with simplified instructions
- Cleaned up redundant documentation files

## 🔄 Migration from Old Setup

If you were using the old interactive setup:
1. Your existing `.env` file will continue to work
2. New users can use the simplified setup
3. The new setup scripts are much more user-friendly

## 🎉 Result

**Before**: Clone → Run interactive script → Enter API keys → Start
**After**: Clone → Run setup script → Start (add API keys later if needed)

Much simpler! 🚀
