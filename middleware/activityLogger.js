import notificationService from '../services/notificationService.js';

/**
 * Middleware to log API actions automatically
 */
export const activityLogger = (req, res, next) => {
  // Capture original end function
  const originalEnd = res.end;

  // Function to intercept response finish
  res.end = function(chunk, encoding) {
    // Call original end first
    originalEnd.apply(res, [chunk, encoding]);

    // Log all non-GET requests
    if (!['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
      try {
        const user = req.user;
        if (!user) return; // Skip if no authenticated user

        // Use the notification service to log the action
        notificationService.logApiAction(req, res, () => {}).catch(err => {
          console.error('Error logging activity:', err);
        });
      } catch (error) {
        console.error('Activity logger error:', error);
      }
    }
  };

  next();
};
