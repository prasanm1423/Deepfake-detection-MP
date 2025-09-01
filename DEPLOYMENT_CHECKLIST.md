# ✅ Vercel Deployment Checklist

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All files are committed to git
- [ ] No sensitive data in code (API keys, passwords)
- [ ] Build passes locally (`npm run build`)
- [ ] TypeScript compilation successful
- [ ] No console errors in development

### 2. Environment Variables
- [ ] `SIGHTENGINE_USER` - Your Sightengine username
- [ ] `SIGHTENGINE_SECRET` - Your Sightengine secret key
- [ ] `RESEMBLE_API_KEY` - Your Resemble AI API key
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Your Supabase anonymous key

### 3. Configuration Files
- [ ] `vercel.json` - Vercel configuration
- [ ] `.vercelignore` - Excludes unnecessary files
- [ ] `api/index.ts` - Serverless function entry point
- [ ] `uploads/.gitkeep` - Ensures uploads directory exists

### 4. Dependencies
- [ ] All dependencies in `package.json`
- [ ] No missing peer dependencies
- [ ] `serverless-http` package included
- [ ] TypeScript types available

## Deployment Steps

### Step 1: GitHub Repository
```bash
# Ensure your code is on GitHub
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Vercel Dashboard Setup
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/spa`
   - **Install Command**: `npm install`

### Step 3: Environment Variables
Add these in Vercel dashboard:
- `SIGHTENGINE_USER`
- `SIGHTENGINE_SECRET`
- `RESEMBLE_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Check build logs for errors

## Post-Deployment Verification

### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] No console errors
- [ ] Responsive design works

### 2. API Endpoints
- [ ] `/api/status` - Returns API status
- [ ] `/api/ping` - Health check
- [ ] `/api/demo` - Demo endpoint
- [ ] `/api/analyze` - File analysis (test with small file)

### 3. File Upload
- [ ] File selection works
- [ ] Upload progress shows
- [ ] Analysis completes
- [ ] Results display correctly

### 4. Media Viewer
- [ ] Images display in results
- [ ] Videos play correctly
- [ ] Audio plays correctly
- [ ] File download works

## Troubleshooting Common Issues

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are installed
- Verify TypeScript compilation

### Environment Variables
- Double-check variable names
- Ensure all required vars are set
- Redeploy after adding variables

### API Errors
- Check function logs in Vercel
- Verify API keys are correct
- Test endpoints individually

### File Upload Issues
- Vercel has file size limits
- Consider external storage for production
- Test with smaller files first

## Performance Optimization

### 1. Enable Caching
- Static assets should be cached
- API responses can be cached where appropriate

### 2. Monitor Performance
- Use Vercel Analytics
- Check Core Web Vitals
- Monitor function execution times

### 3. Optimize Images
- Use WebP format
- Implement lazy loading
- Compress images appropriately

## Security Considerations

### 1. Environment Variables
- Never commit API keys to git
- Use Vercel's secure environment variable system

### 2. CORS Configuration
- Restrict origins to your domains
- Don't use wildcard origins

### 3. Rate Limiting
- Implement proper rate limiting
- Monitor for abuse

## File Storage Limitations

**Important**: Vercel serverless functions have limitations:
- **File System**: Read-only, temporary
- **Storage**: No persistent file storage
- **Size Limits**: 50MB per function execution

**For Production Use**:
1. **AWS S3**: Store files in S3 buckets
2. **Cloudinary**: Use Cloudinary for media storage
3. **Supabase Storage**: Use Supabase storage
4. **Database BLOB**: Store small files in database

## Monitoring and Maintenance

### 1. Regular Checks
- Monitor function logs
- Check error rates
- Review performance metrics

### 2. Updates
- Keep dependencies updated
- Monitor security advisories
- Update API keys when needed

### 3. Backup
- Regular database backups
- Code repository backups
- Configuration backups

---

## 🎉 Success Criteria

Your deployment is successful when:
- [ ] All pages load without errors
- [ ] File upload and analysis work
- [ ] Media viewer displays content
- [ ] API endpoints respond correctly
- [ ] No console errors in browser
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable

**Congratulations! Your deepfake detection app is now live on Vercel! 🚀**
