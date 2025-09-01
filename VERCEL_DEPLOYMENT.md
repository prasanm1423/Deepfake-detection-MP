# 🚀 Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare your API keys

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 1.2 Environment Variables
Create a `.env` file locally with your API keys:
```env
SIGHTENGINE_USER=your_sightengine_user
SIGHTENGINE_SECRET=your_sightengine_secret
RESEMBLE_API_KEY=your_resemble_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/spa`
   - **Install Command**: `npm install`

4. **Environment Variables**
   - Click "Environment Variables"
   - Add each variable from your `.env` file:
     - `SIGHTENGINE_USER`
     - `SIGHTENGINE_SECRET`
     - `RESEMBLE_API_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set up environment variables
   - Deploy

## Step 3: Configure Custom Domain (Optional)

1. **Go to Project Settings**
   - In your Vercel dashboard, select your project
   - Go to "Settings" → "Domains"

2. **Add Custom Domain**
   - Enter your domain name
   - Follow DNS configuration instructions

## Step 4: Verify Deployment

### 4.1 Check Build Logs
- Go to your project in Vercel dashboard
- Check "Deployments" tab for build logs
- Ensure no errors in the build process

### 4.2 Test Functionality
- Visit your deployed URL
- Test file upload functionality
- Verify API endpoints work
- Check media viewer functionality

## Step 5: Post-Deployment Configuration

### 5.1 Update Frontend API URLs
If your frontend is hardcoded to use `localhost:8080`, update the API base URL:

```typescript
// In shared/api.ts or similar
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-domain.vercel.app/api'
  : 'http://localhost:8080/api';
```

### 5.2 Configure CORS
Update CORS settings in `server/index.ts` to include your Vercel domain:

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://your-vercel-domain.vercel.app',
  'https://your-custom-domain.com'
];
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **Environment Variables**
   - Ensure all required env vars are set in Vercel
   - Check variable names match exactly
   - Redeploy after adding new variables

3. **API Errors**
   - Check function logs in Vercel dashboard
   - Verify API endpoints are working
   - Test with Postman or similar tool

4. **File Upload Issues**
   - Vercel has limitations on file storage
   - Consider using external storage (AWS S3, Cloudinary)
   - Files uploaded to Vercel are temporary

### File Storage Limitations

**Important**: Vercel serverless functions have limitations:
- **File System**: Read-only, temporary
- **Storage**: No persistent file storage
- **Size Limits**: 50MB per function execution

**Solutions**:
1. **Use External Storage**: AWS S3, Cloudinary, or similar
2. **Database Storage**: Store files as BLOB in database
3. **CDN**: Use a CDN for file serving

## Performance Optimization

1. **Enable Caching**
   - Add cache headers for static assets
   - Use Vercel's edge caching

2. **Optimize Images**
   - Use WebP format
   - Implement lazy loading
   - Use responsive images

3. **Code Splitting**
   - Implement dynamic imports
   - Split large bundles

## Monitoring

1. **Vercel Analytics**
   - Enable in project settings
   - Monitor performance metrics

2. **Function Logs**
   - Check function execution logs
   - Monitor error rates

3. **Performance**
   - Use Vercel Speed Insights
   - Monitor Core Web Vitals

## Security Considerations

1. **Environment Variables**
   - Never commit API keys to git
   - Use Vercel's environment variable system

2. **CORS Configuration**
   - Restrict origins to your domains
   - Don't use wildcard origins

3. **Rate Limiting**
   - Implement proper rate limiting
   - Monitor for abuse

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Project Issues**: Check your project's GitHub issues

---

**🎉 Congratulations! Your deepfake detection app is now deployed on Vercel!**
