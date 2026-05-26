import rateLimit from 'express-rate-limit';

// Strict limit for login to prevent brute force attacks
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per window
  message: { 
    error: 'Too many login attempts from this IP, please try again after 15 minutes.' 
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Optional: A more generous global API limiter (e.g., 100 requests per 10 mins)
export const globalApiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: { 
    error: 'Too many requests, please try again later.' 
  }
});