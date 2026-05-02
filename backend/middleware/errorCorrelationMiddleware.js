import { v4 as uuidv4 } from 'uuid';
import { getAuthCookieOptions } from '../utils/cookieUtils.js';

/**
 * Middleware to add error correlation ID to each request
 * Helps track requests through logs and error responses
 */
export const correlationIdMiddleware = (req, res, next) => {
  // Generate or use existing correlation ID
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  
  // Store in request for logging
  req.correlationId = correlationId;
  
  // Add to response headers for client tracking
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Override res.json to include correlation ID in all responses
  const originalJson = res.json;
  res.json = function(data) {
    if (typeof data === 'object' && data !== null) {
      data.correlationId = correlationId;
    }
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Middleware to track and enforce session timeout
 * Tracks last activity time and logs out if timeout exceeded
 */
export const sessionTimeoutMiddleware = (req, res, next) => {
  const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT, 10);

  if (!Number.isFinite(SESSION_TIMEOUT)) {
    throw new Error('SESSION_TIMEOUT must be configured in the environment');
  }
  
  if (req.admin) {
    const now = Date.now();
    const lastActivity = req.cookies?.lastActivity || now;
    const timeSinceLastActivity = now - parseInt(lastActivity);
    
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      // Session expired
      res.clearCookie('adminToken', getAuthCookieOptions());
      res.clearCookie('lastActivity', getAuthCookieOptions());
      return res.status(401).json({
        success: false,
        message: 'Session expired due to inactivity',
        code: 'SESSION_EXPIRED',
      });
    }
    
    // Update last activity timestamp
    res.cookie('lastActivity', String(now), getAuthCookieOptions({ maxAge: SESSION_TIMEOUT }));
  }
  
  next();
};

/**
 * Middleware to add request ID and correlation ID to logs
 */
export const requestLoggingMiddleware = (req, res, next) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  
  // Log request details
  if (process.env.LOG_LEVEL !== 'error') {
    console.log(`[${requestId}] ${req.method} ${req.path}`);
  }
  
  // Log response
  res.on('finish', () => {
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    if (process.env.LOG_LEVEL !== 'error' || logLevel === 'error') {
      console.log(
        `[${requestId}] ${req.method} ${req.path} - HTTP ${res.statusCode}`
      );
    }
  });
  
  next();
};
