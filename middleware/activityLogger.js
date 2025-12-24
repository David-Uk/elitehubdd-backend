import db from '../models/index.js';
const { Notification } = db;

/**
 * Middleware to log user activities/actions
 */
const activityLogger = async (req, res, next) => {
  // Only log if user is authenticated
  if (!req.user) {
    return next();
  }

  // Intercept the response to log only on success (optional, but requested "performed")
  // Or log the intent. Usually, auditing logs the intent and then the result.
  // We'll log after the response is finished to know if it succeeded.
  
  const originalEnd = res.end;
  const startTime = Date.now();

  res.end = function (...args) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Only log state-changing methods or as configured
    const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    
    if (stateChangingMethods.includes(req.method) && statusCode < 400) {
      // Determine action string
      let action = `${req.method}_${req.baseUrl || ''}${req.path}`
        .replace(/\//g, '_')
        .toUpperCase()
        .replace(/^_/, '');
      
      // Cleanup action string
      // e.g., POST_API_RESERVATIONS
      
      const message = `${req.user.role} ${req.user.email} performed ${req.method} on ${req.originalUrl}`;

      // Prepare metadata (sensitive fields should be filtered)
      const metadata = {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        duration,
        query: req.query,
        // body: req.body // Be careful with body, might contain passwords. Use filtering if needed.
      };

      // Filter sensitive fields from metadata body if we were to include it
      if (req.body) {
        const sensitiveFields = ['password', 'token', 'secret', 'creditCard'];
        const filteredBody = { ...req.body };
        sensitiveFields.forEach(field => {
          if (filteredBody[field]) filteredBody[field] = '********';
        });
        metadata.body = filteredBody;
      }

      // Record the notification/activity in background
      Notification.create({
        staffId: req.user.id, // Assuming req.user.id is the staff ID
        userId: null, // If there's a separate User model, logic would go here
        action: action,
        type: statusCode >= 400 ? 'error' : 'info',
        message: message,
        metadata: metadata,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        read: false
      }).catch(err => {
        console.error('Failed to create activity log:', err);
      });
    }

    return originalEnd.apply(this, args);
  };

  next();
};

export default activityLogger;
