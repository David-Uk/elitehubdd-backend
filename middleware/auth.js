import authService from '../services/authService.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get staff details
    const staff = await authService.getStaffById(decoded.id);

    // Block forbidden statuses
    const blockedStatuses = ['disabled', 'suspended', 'retired', 'retrenched'];
    if (blockedStatuses.includes(staff.status)) {
      return res.status(403).json({
        success: false,
        message: `Your account is ${staff.status}. Access denied.`
      });
    }

    // Attach user to request
    req.user = {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      department: staff.department,
      status: staff.status
    };

    next();
  } catch (error) {
    console.log(error.message)
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Admin always has access
    if (req.user.role === 'admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user belongs to required department
 * Supports both department codes (e.g., 'reception') and department IDs (UUIDs)
 */
export const authorizeDepartment = (...departments) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Admins bypass department checks
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      // Import Department model
      const db = (await import('../models/index.js')).default;
      const { Department } = db;

      // Get user's department information
      let userDepartment;
      if (req.user.departmentId) {
        userDepartment = await Department.findByPk(req.user.departmentId);
      } else if (req.user.department) {
        // Fallback for old enum-based department
        userDepartment = await Department.findOne({
          where: { code: req.user.department }
        });
      }

      if (!userDepartment) {
        return res.status(403).json({
          success: false,
          message: 'User department not found'
        });
      }

      // Check if user's department matches any of the required departments
      // Support both department codes and IDs
      const hasAccess = departments.some(dept => {
        // Check if it's a UUID (department ID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(dept)) {
          return userDepartment.id === dept;
        }
        // Otherwise, treat as department code
        return userDepartment.code === dept;
      });

      if (!hasAccess) {
        const deptNames = departments.join(', ');
        return res.status(403).json({
          success: false,
          message: `Access denied. Restricted to ${deptNames} department.`
        });
      }

      next();
    } catch (error) {
      console.error('Department authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking department authorization'
      });
    }
  };
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = authorize('admin');

/**
 * Middleware to check if user is admin or manager
 */
export const isAdminOrManager = authorize('admin', 'manager');
