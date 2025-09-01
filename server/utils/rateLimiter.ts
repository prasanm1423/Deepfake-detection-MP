import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// In-memory store for tracking API calls to external services
const apiCallStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration for external APIs
const API_RATE_LIMITS = {
  sightengine: {
    callsPerMinute: 20, // Increased from 10 to 20 per minute
    callsPerHour: 200,  // Increased from 100 to 200 per hour
    callsPerDay: 2000   // Increased from 1000 to 2000 per day
  },
  resemble: {
    callsPerMinute: 10, // Increased from 5 to 10 per minute
    callsPerHour: 100,  // Increased from 50 to 100 per hour
    callsPerDay: 1000   // Increased from 500 to 1000 per day
  }
};

/**
 * Check if we can make an API call to the specified service
 */
export function canMakeAPICall(service: 'sightengine' | 'resemble'): boolean {
  const now = Date.now();
  const key = `${service}_${Math.floor(now / 60000)}`; // Minute-based key
  const hourKey = `${service}_${Math.floor(now / 3600000)}`; // Hour-based key
  const dayKey = `${service}_${Math.floor(now / 86400000)}`; // Day-based key

  const limits = API_RATE_LIMITS[service];
  
  // Check minute limit
  const minuteData = apiCallStore.get(key) || { count: 0, resetTime: now + 60000 };
  if (minuteData.count >= limits.callsPerMinute) {
    return false;
  }

  // Check hour limit
  const hourData = apiCallStore.get(hourKey) || { count: 0, resetTime: now + 3600000 };
  if (hourData.count >= limits.callsPerHour) {
    return false;
  }

  // Check day limit
  const dayData = apiCallStore.get(dayKey) || { count: 0, resetTime: now + 86400000 };
  if (dayData.count >= limits.callsPerDay) {
    return false;
  }

  return true;
}

/**
 * Record an API call to the specified service
 */
export function recordAPICall(service: 'sightengine' | 'resemble'): void {
  const now = Date.now();
  const minuteKey = `${service}_${Math.floor(now / 60000)}`;
  const hourKey = `${service}_${Math.floor(now / 3600000)}`;
  const dayKey = `${service}_${Math.floor(now / 86400000)}`;

  // Update minute count
  const minuteData = apiCallStore.get(minuteKey) || { count: 0, resetTime: now + 60000 };
  minuteData.count++;
  apiCallStore.set(minuteKey, minuteData);

  // Update hour count
  const hourData = apiCallStore.get(hourKey) || { count: 0, resetTime: now + 3600000 };
  hourData.count++;
  apiCallStore.set(hourKey, hourData);

  // Update day count
  const dayData = apiCallStore.get(dayKey) || { count: 0, resetTime: now + 86400000 };
  dayData.count++;
  apiCallStore.set(dayKey, dayData);

  // Clean up old entries
  cleanupOldEntries();
}

/**
 * Get remaining API calls for a service
 */
export function getRemainingAPICalls(service: 'sightengine' | 'resemble'): {
  minute: number;
  hour: number;
  day: number;
  nextReset: number;
} {
  const now = Date.now();
  const minuteKey = `${service}_${Math.floor(now / 60000)}`;
  const hourKey = `${service}_${Math.floor(now / 3600000)}`;
  const dayKey = `${service}_${Math.floor(now / 86400000)}`;

  const limits = API_RATE_LIMITS[service];
  
  const minuteData = apiCallStore.get(minuteKey) || { count: 0, resetTime: now + 60000 };
  const hourData = apiCallStore.get(hourKey) || { count: 0, resetTime: now + 3600000 };
  const dayData = apiCallStore.get(dayKey) || { count: 0, resetTime: now + 86400000 };

  return {
    minute: Math.max(0, limits.callsPerMinute - minuteData.count),
    hour: Math.max(0, limits.callsPerHour - hourData.count),
    day: Math.max(0, limits.callsPerDay - dayData.count),
    nextReset: minuteData.resetTime
  };
}

/**
 * Clean up old entries from the store
 */
function cleanupOldEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, data] of apiCallStore.entries()) {
    if (data.resetTime < now) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => apiCallStore.delete(key));
}

/**
 * Reset all rate limit counters (for development/testing)
 */
export function resetRateLimits(): void {
  apiCallStore.clear();
  console.log('Rate limits reset successfully');
}

/**
 * Exponential backoff retry function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on certain errors
      if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`API call failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Serverless-friendly rate limiters that don't rely on IP addresses
 */
export const createRateLimiters = () => {
  // Create a key generator that works in serverless environments
  const createServerlessKey = (prefix: string) => {
    return (req: Request) => {
      // Use user agent and a combination of headers for identification
      const userAgent = req.get('User-Agent') || 'unknown';
      const acceptLanguage = req.get('Accept-Language') || 'unknown';
      const acceptEncoding = req.get('Accept-Encoding') || 'unknown';
      
      // Create a fingerprint based on request characteristics
      const fingerprint = `${prefix}:${userAgent}:${acceptLanguage}:${acceptEncoding}`;
      
      // Add timestamp-based component to prevent long-term bypass
      const timeWindow = Math.floor(Date.now() / (15 * 60 * 1000)); // 15-minute windows
      
      return `${fingerprint}:${timeWindow}`;
    };
  };

  // General API rate limiter
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per 15 minutes
    keyGenerator: createServerlessKey('general'),
    message: {
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later.',
      retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later.',
        retryAfter: 15 * 60
      });
    }
  });

  // Analysis rate limiter (more restrictive)
  const analysisLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 analysis requests per 15 minutes
    keyGenerator: createServerlessKey('analysis'),
    message: {
      success: false,
      error: 'Analysis rate limit exceeded',
      message: 'You have exceeded the analysis limit. Please wait before uploading more files.',
      retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: 'Analysis rate limit exceeded',
        message: 'You have exceeded the analysis limit. Please wait before uploading more files.',
        retryAfter: 15 * 60
      });
    }
  });

  // Upload rate limiter (most restrictive)
  const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 file uploads per 15 minutes
    keyGenerator: createServerlessKey('upload'),
    message: {
      success: false,
      error: 'Upload rate limit exceeded',
      message: 'You have exceeded the upload limit. Please wait before uploading more files.',
      retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: 'Upload rate limit exceeded',
        message: 'You have exceeded the upload limit. Please wait before uploading more files.',
        retryAfter: 15 * 60
      });
    }
  });

  // API status rate limiter (less restrictive)
  const statusLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200, // 200 status checks per 5 minutes
    keyGenerator: createServerlessKey('status'),
    message: {
      success: false,
      error: 'Status check rate limit exceeded',
      message: 'Too many status checks. Please wait before checking again.',
      retryAfter: 5 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: 'Status check rate limit exceeded',
        message: 'Too many status checks. Please wait before checking again.',
        retryAfter: 5 * 60
      });
    }
  });

  return {
    generalLimiter,
    analysisLimiter,
    uploadLimiter,
    statusLimiter
  };
};

/**
 * Middleware to check API rate limits before making external calls
 */
export const checkAPIRateLimit = (service: 'sightengine' | 'resemble') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!canMakeAPICall(service)) {
      const remaining = getRemainingAPICalls(service);
      return res.status(429).json({
        success: false,
        error: 'External API rate limit exceeded',
        message: `Rate limit exceeded for ${service} API. Please try again later.`,
        retryAfter: Math.ceil((remaining.nextReset - Date.now()) / 1000),
        limits: {
          remaining: remaining,
          limits: API_RATE_LIMITS[service]
        }
      });
    }
    next();
  };
};

/**
 * Middleware to record API calls after successful requests
 */
export const recordAPICallMiddleware = (service: 'sightengine' | 'resemble') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Record the API call
    recordAPICall(service);
    
    // Add rate limit info to response headers
    const remaining = getRemainingAPICalls(service);
    res.setHeader('X-RateLimit-Remaining-Minute', remaining.minute);
    res.setHeader('X-RateLimit-Remaining-Hour', remaining.hour);
    res.setHeader('X-RateLimit-Remaining-Day', remaining.day);
    res.setHeader('X-RateLimit-Reset', remaining.nextReset);
    
    next();
  };
};
