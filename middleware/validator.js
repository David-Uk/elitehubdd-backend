import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation error handler
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Staff registration validation
 */
export const validateStaffRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'receptionist', 'housekeeping', 'restaurant_staff', 'bar_staff', 'maintenance'])
    .withMessage('Invalid role'),
  
  handleValidationErrors
];

/**
 * Login validation
 */
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Reservation validation
 */
export const validateReservation = [
  body('guestId')
    .notEmpty()
    .withMessage('Guest ID is required')
    .isUUID()
    .withMessage('Invalid guest ID'),
  
  body('roomId')
    .notEmpty()
    .withMessage('Room ID is required')
    .isUUID()
    .withMessage('Invalid room ID'),
  
  body('checkInDate')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Invalid check-in date format')
    .custom((value) => {
      const checkIn = new Date(value);
      const now = new Date();
      if (checkIn < now) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),
  
  body('checkOutDate')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Invalid check-out date format')
    .custom((value, { req }) => {
      const checkOut = new Date(value);
      const checkIn = new Date(req.body.checkInDate);
      if (checkOut <= checkIn) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  
  body('numberOfGuests')
    .notEmpty()
    .withMessage('Number of guests is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of guests must be between 1 and 10'),
  
  body('totalAmount')
    .notEmpty()
    .withMessage('Total amount is required')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters'),
  
  handleValidationErrors
];

/**
 * Restaurant order validation
 */
export const validateRestaurantOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.menuItemId')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isUUID()
    .withMessage('Invalid menu item ID'),
  
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  body('orderType')
    .optional()
    .isIn(['dine_in', 'room_service', 'takeaway'])
    .withMessage('Invalid order type'),
  
  body('tableNumber')
    .if(body('orderType').equals('dine_in'))
    .notEmpty()
    .withMessage('Table number is required for dine-in orders')
    .isLength({ max: 20 })
    .withMessage('Table number must not exceed 20 characters'),
  
  handleValidationErrors
];

/**
 * Bar order validation
 */
export const validateBarOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.barItemId')
    .notEmpty()
    .withMessage('Bar item ID is required')
    .isUUID()
    .withMessage('Invalid bar item ID'),
  
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50'),
  
  body('orderType')
    .optional()
    .isIn(['bar', 'room_service'])
    .withMessage('Invalid order type'),
  
  handleValidationErrors
];

/**
 * UUID parameter validation
 */
export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

/**
 * Date range validation for reports
 */
export const validateDateRange = [
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.query.startDate);
      if (endDate < startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Password change validation
 */
export const validatePasswordChange = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
  
  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateStaffRegistration,
  validateLogin,
  validateReservation,
  validateRestaurantOrder,
  validateBarOrder,
  validateUUID,
  validateDateRange,
  validatePasswordChange
};
