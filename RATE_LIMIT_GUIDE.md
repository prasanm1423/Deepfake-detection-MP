# Rate Limit Handling Guide

This guide explains how the DeepGuard application handles rate limits and provides solutions for common API errors.

## 🚨 Understanding Rate Limits

### What are Rate Limits?

Rate limits are restrictions placed on how many API calls you can make within a specific time period. This prevents abuse and ensures fair usage of the service.

### Why Do Rate Limits Exist?

1. **Prevent Abuse**: Stop malicious users from overwhelming the service
2. **Fair Usage**: Ensure all users have access to the API
3. **Cost Control**: Manage server resources and costs
4. **Service Stability**: Maintain consistent performance for all users

## 📊 Current Rate Limits

### Sightengine API Limits
- **Per Minute**: 10 calls
- **Per Hour**: 100 calls  
- **Per Day**: 1,000 calls

### Resemble AI API Limits
- **Per Minute**: 5 calls
- **Per Hour**: 50 calls
- **Per Day**: 500 calls

### Application Rate Limits
- **General Requests**: 100 per 15 minutes
- **Analysis Requests**: 15 per 15 minutes
- **File Uploads**: 8 per 15 minutes
- **Status Checks**: 30 per 5 minutes

## 🔧 Enhanced Rate Limit Features

### 1. **Smart Rate Limiting**
- Tracks API calls per service
- Prevents exceeding external API limits
- Provides real-time usage information

### 2. **Exponential Backoff Retry**
- Automatically retries failed requests
- Uses exponential backoff (1s, 2s, 4s delays)
- Handles temporary network issues

### 3. **User-Friendly Error Messages**
- Clear explanations of rate limit errors
- Countdown timers for retry periods
- Visual progress indicators

### 4. **Graceful Fallbacks**
- Falls back to demo mode when APIs are unavailable
- Continues to provide analysis results
- Maintains user experience during outages

## 🛠️ How to Handle Rate Limit Errors

### When You See a Rate Limit Error:

1. **Don't Panic**: This is normal and expected behavior
2. **Wait for the Timer**: The countdown shows when you can retry
3. **Use the Retry Button**: Click "Try Again" when the timer reaches zero
4. **Check Usage Limits**: View your remaining API calls

### Best Practices:

1. **Space Out Requests**: Don't make multiple requests simultaneously
2. **Monitor Usage**: Check the rate limit status regularly
3. **Plan Ahead**: For bulk analysis, spread requests over time
4. **Use Demo Mode**: Test with demo mode when learning the system

## 🔍 Understanding Error Messages

### Common Error Types:

#### 1. **"Rate limit exceeded"**
- **Cause**: Too many requests in a short time
- **Solution**: Wait for the countdown timer and retry

#### 2. **"External API rate limit exceeded"**
- **Cause**: Sightengine or Resemble AI service limit reached
- **Solution**: Wait longer (usually 1-5 minutes)

#### 3. **"Analysis rate limit exceeded"**
- **Cause**: Too many file uploads/analysis requests
- **Solution**: Wait 15 minutes before uploading more files

#### 4. **"Upload rate limit exceeded"**
- **Cause**: Too many file uploads
- **Solution**: Wait 15 minutes before uploading more files

## 📈 Monitoring Your Usage

### Check Rate Limits:
```bash
GET /api/rate-limits
```

### Response Format:
```json
{
  "sightengine": {
    "minute": 8,
    "hour": 95,
    "day": 950,
    "nextReset": 1640995200000
  },
  "resemble": {
    "minute": 4,
    "hour": 45,
    "day": 450,
    "nextReset": 1640995200000
  }
}
```

### Understanding the Numbers:
- **minute**: Remaining calls in the current minute
- **hour**: Remaining calls in the current hour
- **day**: Remaining calls in the current day
- **nextReset**: When the minute limit resets (timestamp)

## 🚀 Pro Tips for Avoiding Rate Limits

### 1. **Batch Processing**
- Upload multiple files with delays between each
- Use the 15-minute windows effectively
- Plan your analysis sessions

### 2. **Monitor Usage**
- Check rate limits before starting bulk analysis
- Use the status endpoint to track remaining calls
- Set up alerts for when limits are approaching

### 3. **Optimize File Sizes**
- Compress images before upload
- Use appropriate file formats
- Stay under the 10MB limit

### 4. **Use Demo Mode**
- Test functionality with demo mode
- Learn the interface without using API calls
- Practice with sample files

## 🔄 Automatic Retry Logic

### How Retries Work:
1. **First Attempt**: Immediate API call
2. **First Retry**: Wait 2 seconds + random delay
3. **Second Retry**: Wait 4 seconds + random delay
4. **Third Retry**: Wait 8 seconds + random delay
5. **Final Failure**: Return error to user

### Retry Conditions:
- ✅ Network timeouts
- ✅ Server errors (5xx)
- ✅ Temporary rate limits
- ❌ Authentication errors (4xx)
- ❌ Bad requests (4xx)
- ❌ Permanent rate limits

## 🛡️ Error Recovery Strategies

### 1. **Immediate Recovery**
- Wait for countdown timer
- Use retry button when available
- Check network connection

### 2. **Short-term Recovery**
- Switch to demo mode temporarily
- Use different file types
- Reduce file sizes

### 3. **Long-term Recovery**
- Upgrade to Pro/Enterprise plan
- Contact support for rate limit increases
- Implement caching strategies

## 📞 Getting Help

### When to Contact Support:
- Rate limits seem too restrictive
- Errors persist after waiting
- Need higher limits for business use
- Unexpected behavior

### Information to Provide:
- Error message and timestamp
- Current usage statistics
- Steps to reproduce the issue
- Account type and plan

## 🔧 Technical Implementation

### Rate Limiting Components:
- `server/utils/rateLimiter.ts`: Core rate limiting logic
- `client/components/RateLimitHandler.tsx`: UI for handling errors
- Enhanced error handling in API routes
- Automatic retry with exponential backoff

### Configuration:
- Rate limits are configurable in the rate limiter utility
- Different limits for different endpoints
- Separate tracking for external APIs

## 📋 Rate Limit Checklist

### Before Starting Analysis:
- [ ] Check current rate limits
- [ ] Ensure files are under 10MB
- [ ] Have backup files ready
- [ ] Plan for potential delays

### During Analysis:
- [ ] Monitor rate limit headers
- [ ] Space out requests if needed
- [ ] Use retry buttons when available
- [ ] Keep track of remaining calls

### After Analysis:
- [ ] Review any rate limit errors
- [ ] Note patterns in usage
- [ ] Plan for future sessions
- [ ] Consider upgrading if needed

---

**Remember**: Rate limits are there to ensure fair usage and service stability. With proper planning and the enhanced error handling, you can work efficiently within these limits while maintaining a great user experience.
