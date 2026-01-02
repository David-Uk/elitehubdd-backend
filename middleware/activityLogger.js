import notificationService from '../services/notificationService.js';

/**
 * Middleware to log API actions automatically
 */
export const activityLogger = (req, res, next) => {
  // Capture original end function
  const originalEnd = res.end;
  // const startTime = Date.now(); // Unused

  // Function to intercept response finish
  res.end = function(chunk, encoding) {
    // Call original end first
    originalEnd.apply(res, [chunk, encoding]);

    // After response is sent (next tick maybe, to ensure headers sent)
    // We only log if it's a mutation (POST, PUT, PATCH, DELETE) and successful (2xx)
    // We can also log errors if needed, but prompt implies "actions when conducted" (successful actions usually).
    // Let's log successes.
    
    // Check if status is 2xx
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Ignore GET requests (usually) unless specific critical reads?
      // Prompt: "All API actions".
      // Creating, updating, deleting are "actions". Reading is "viewing".
      // I'll filter out GET and OPTIONS.
      if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) return;

      const userId = req.user ? req.user.id : null;
      const staffId = req.user && req.user.staffId ? req.user.staffId : null; // Assuming staffId exists on req.user if populated
      
      // Determine Action Name
      // Map Method + URL to Action
      // e.g. POST /api/inventory/items -> INVENTORY_ITEM_CREATE
      const action = deriveAction(req);
      const message = deriveMessage(req);
      const targetRoles = deriveTargetRoles(req);
      
      const metadata = {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined, // Be careful with sensitive data?
        actor: req.user ? {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          staffId: req.user.staffId
          // Add staff name if available on req.user (depends on validaton/auth middleware population)
        } : 'system' 
      };

      // Sanitize metadata
      if (metadata.body && metadata.body.password) metadata.body.password = '***';

      notificationService.logAction({
        action,
        message,
        userId,
        staffId,
        targetRoles,
        metadata,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        type: 'success'
      }).catch(err => console.error('Error logging activity:', err));
    }
  };

  next();
};

// Helper to derive action name
function deriveAction(req) {
  const method = req.method;
  const path = req.baseUrl || req.path;
  const cleanPath = path.replace(/\/api\//, '').replace(/\//g, '_').toUpperCase(); // e.g. INVENTORY_ITEMS
  
  // Refine action from path parameters
  // e.g. inventory_items_123_stock -> INVENTORY_ITEMS_STOCK
  // Remove UUIDs from path
  // UUID regex roughly: [0-9a-f]{8}-... or just long alphanumeric strings
  // Simple heuristic: remove segments with numbers or > 20 chars?
  // Or verify against routes?
  // Let's do a simple replace of UUID-like strings with 'ID'
  const actionPath = cleanPath.replace(/[0-9a-f-]{20,}/gi, 'ID');
  
  return `${method}_${actionPath}`;
}

// Helper to derive human readable message
function deriveMessage(req) {
  // Can be improved with a map
  const methodStr = req.method;
  const resource = req.baseUrl.split('/').pop() || 'Resource';
  return `${methodStr} action on ${resource}`;
}

// Helper to derive target roles
function deriveTargetRoles(req) {
  // Default roles are Admin/Super Admin (handled in service)
  // We add specific roles based on domain
  const roles = [];
  const url = req.baseUrl;

  if (url.includes('inventory')) roles.push('accountant');
  if (url.includes('reservations')) roles.push('receptionist', 'manager', 'supervisor');
  if (url.includes('orders')) roles.push('waiter', 'kitchen_staff', 'manager', 'supervisor'); // Generic
  if (url.includes('bar')) roles.push('bar_staff', 'manager', 'supervisor');
  if (url.includes('restaurant')) roles.push('restaurant_staff', 'manager', 'supervisor');
  if (url.includes('staff') || url.includes('users')) roles.push('admin'); // HR?

  // specific
  if (url.includes('report')) roles.push('accountant', 'manager', 'supervisor');

  return roles;
}
