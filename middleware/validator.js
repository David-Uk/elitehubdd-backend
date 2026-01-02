import { body, param, query, validationResult, matchedData, oneOf } from 'express-validator';

/**
 * Validation error handler & Data Filter
 * Filters req.body to only contain validated fields
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
  
  // Replace req.body with only validated data
  // Only for methods that have a body
  if (req.method !== 'GET') {
     const data = matchedData(req, { locations: ['body'], includeOptionals: true });
     // We only replace if there was actually some validation run on the body
     // Otherwise we might wipe out the body if no body validators were set
     if (Object.keys(data).length > 0) {
        req.body = data;
     }
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
    .isIn(['super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist', 'housekeeping', 'restaurant_staff', 'bar_staff', 'waiter', 'kitchen_staff', 'maintenance'])
    .withMessage('Invalid role'),
    
  body('department')
    .optional()
    .custom((val, { req }) => {
      // Super admin and admin have access to all departments and should not provide a department
      if (val && ['super_admin', 'admin'].includes(req.body.role)) {
        throw new Error('Super admin and admin must not include a department');
      }
      return true;
    })
    .isIn(['reception', 'housekeeping', 'maintenance', 'management', 'restaurant'])
    .withMessage('Invalid department'),

  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended', 'disabled', 'on leave', 'retired', 'retrenched'])
    .withMessage('Invalid status'),

  body('gender')
    .isIn(['male', 'female'])
    .withMessage('Gender is required (male/female)'),

  body('address')
    .optional()
    .trim(),

  body('hireDate')
    .optional()
    .isISO8601(),

  handleValidationErrors
];

/**
 * Admin and Super Admin registration validation (no department, role, hireDate, address, or status fields)
 */
export const validateAdminRegistration = [
  body('username')
    .optional()
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

  body('gender')
    .isIn(['male', 'female'])
    .withMessage('Gender is required (male/female)'),

  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 }),

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
 * User/Staff Update Validation
 */
export const validateUserUpdate = [
  body('firstName').optional().trim().notEmpty().isLength({ max: 50 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 50 }),
  body('phoneNumber').optional().matches(/^[0-9+\-\s()]+$/),
  body('role').optional().isIn(['super_admin', 'admin', 'accountant', 'supervisor', 'manager', 'receptionist', 'housekeeping', 'restaurant_staff', 'bar_staff', 'waiter', 'kitchen_staff', 'maintenance']),
  body('position').optional().trim().isLength({ max: 100 }),
  body('status').optional().isIn(['active', 'inactive', 'suspended', 'disabled', 'on leave', 'retired', 'retrenched']),
  body('address').optional().trim(),
  body('email').optional().trim().isEmail().normalizeEmail(),
  // Add other allowed fields
  handleValidationErrors
];

/**
 * Department Validation
 */
export const validateDepartment = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('code').trim().notEmpty().withMessage('Code is required').isLength({ max: 20 }).toUpperCase(),
  body('description').optional().trim(),
  body('headOfDepartment').optional().isUUID(),
  body('budget').optional().isFloat({ min: 0 }),
  body('contactEmail').optional().isEmail(),
  body('contactPhone').optional().matches(/^[0-9+\-\s()]+$/),
  body('status').optional().isIn(['active', 'inactive']),
  handleValidationErrors
];

/**
 * Inventory Item Validation
 */
export const validateInventoryItem = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('description').optional().trim(),
  body('unit').optional().trim(),
  body('minLevel').optional().isInt({ min: 0 }),
  body('maxLevel').optional().isInt({ min: 0 }),
  body('reorderLevel').optional().isInt({ min: 0 }),
  body('costPrice').optional().isFloat({ min: 0 }),
  body('sellingPrice').optional().isFloat({ min: 0 }),
  body('supplier').optional().trim(),
  body('location').optional().trim(),
  handleValidationErrors
];

/**
 * Batch Inventory Item Validation
 */
export const validateBatchInventoryItems = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items array is required and must contain at least one item'),
  
  body('items.*.name')
    .trim()
    .notEmpty()
    .withMessage('Item name is required'),
  
  body('items.*.category')
    .trim()
    .notEmpty()
    .withMessage('Item category is required'),
  
  body('items.*.sku')
    .trim()
    .notEmpty()
    .withMessage('Item SKU is required'),
  
  body('items.*.description')
    .optional()
    .trim(),
  
  body('items.*.unit')
    .optional()
    .trim(),
  
  body('items.*.minLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum level must be a non-negative integer'),
  
  body('items.*.maxLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum level must be a non-negative integer'),
  
  body('items.*.reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  
  body('items.*.costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a non-negative number'),
  
  body('items.*.sellingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Selling price must be a non-negative number'),
  
  body('items.*.supplier')
    .optional()
    .trim(),
  
  body('items.*.location')
    .optional()
    .trim(),
  
  handleValidationErrors
];

/**
 * Inventory Transaction Validation (Addition/Subtraction/Allocation)
 */
export const validateInventoryTransaction = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('reason').optional().trim(),
  body('notes').optional().trim(),
  body('departmentId').optional().isUUID(), // For allocations
  body('reference').optional().trim(),
  body('batchNumber').optional().trim(),
  body('expiryDate').optional().isISO8601(),
  handleValidationErrors
];

/**
 * Room validation
 */
export const validateRoom = [
  body('roomNumber')
    .notEmpty()
    .withMessage('Room number is required')
    .isString()
    .withMessage('Room number must be a string')
    .isLength({ min: 1, max: 10 })
    .withMessage('Room number must be between 1 and 10 characters')
    .matches(/^[A-Z0-9-]+$/i)
    .withMessage('Room number can only contain letters, numbers, and hyphens'),
  
  body('roomTypeId')
    .notEmpty()
    .withMessage('Room type ID is required')
    .isUUID()
    .withMessage('Room type ID must be a valid UUID'),
  
  handleValidationErrors
];

/**
 * Reservation validation
 */
export const validateReservation = [
  // Either guestId (for existing guest) OR guest object (for new guest) is required
  oneOf([
    body('guestId')
      .notEmpty()
      .withMessage('Guest ID is required when not creating a new guest')
      .isUUID()
      .withMessage('Invalid guest ID'),
    body('guest')
      .notEmpty()
      .withMessage('Guest object is required when not using existing guest ID')
      .isObject()
      .withMessage('Guest must be an object')
  ], 'Please provide either guestId (for existing guest) or guest object (for new guest)'),
  
  // If guest object is provided, validate guest fields
  body('guest.firstName')
    .if(body('guest').exists())
    .notEmpty()
    .withMessage('Guest first name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('guest.lastName')
    .if(body('guest').exists())
    .notEmpty()
    .withMessage('Guest last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('guest.email')
    .if(body('guest').exists())
    .notEmpty()
    .withMessage('Guest email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('guest.phone')
    .if(body('guest').exists())
    .notEmpty()
    .withMessage('Guest phone number is required')
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Invalid phone number format'),
  
  body('guest.address')
    .if(body('guest').exists())
    .notEmpty()
    .withMessage('Guest address is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  
  body('guest.city')
    .if(body('guest').exists())
    .notEmpty()
    .withMessage('Guest city is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('guest.country')
    .if(body('guest').exists())
    .notEmpty()
    .withMessage('Guest country is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
  body('guest.idType')
    .if(body('guest').exists())
    .notEmpty()
    .withMessage('Guest ID type is required')
    .isIn(['passport', 'national_id', 'driver_license', 'voter_card', 'other'])
    .withMessage('Invalid ID type'),
  
  body('guest.idNumber')
    .if(body('guest').exists())
    .notEmpty()
    .withMessage('Guest ID number is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('ID number must be between 3 and 50 characters'),
  
  body('guest.dateOfBirth')
    .if(body('guest').exists())
    .notEmpty()
    .withMessage('Guest date of birth is required')
    .isISO8601()
    .withMessage('Invalid date of birth format')
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      if (age < 18 || age > 120) {
        throw new Error('Guest must be between 18 and 120 years old');
      }
      return true;
    }),
  
  body('guest.notes')
    .if(body('guest').exists())
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Guest notes must not exceed 1000 characters'),
  
  body('roomId')
    .notEmpty()
    .withMessage('Room ID is required')
    .custom((value) => {
      // Allow both UUID and room number formats
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const roomNumberRegex = /^[A-Z0-9]{1,10}$/i;
      return uuidRegex.test(value) || roomNumberRegex.test(value);
    })
    .withMessage('Invalid room ID format (must be UUID or room number)'),
  
  body('checkInDate')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Invalid check-in date format')
    .custom((value) => {
      const checkIn = new Date(value);
      const today = new Date();
      // Set today's time to midnight for date-only comparison
      today.setHours(0, 0, 0, 0);
      
      // Set check-in time to midnight for date-only comparison
      const checkInDate = new Date(checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
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
  
  body('specialRequests')
    .optional()
    .isString()
    .withMessage('Special requests must be a string')
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters'),
  
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
    
  body('items.*.details').optional().trim(), // Allow generic item details if needed

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
    
  body('specialInstructions').optional().trim(),
  body('reservationId').optional().isUUID(),
  
  handleValidationErrors
];

/**
 * Menu item validation
 */
export const validateMenuItem = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['appetizer', 'main_course', 'dessert', 'beverage', 'breakfast', 'lunch', 'dinner'])
    .withMessage('Invalid category. Must be one of: appetizer, main_course, dessert, beverage, breakfast, lunch, dinner'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  
  body('preparationTime')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),
  
  body('cuisine')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Cuisine must not exceed 50 characters'),
  
  body('isVegetarian')
    .optional()
    .isBoolean()
    .withMessage('isVegetarian must be a boolean'),
  
  body('isVegan')
    .optional()
    .isBoolean()
    .withMessage('isVegan must be a boolean'),
  
  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),
  
  body('allergens.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each allergen must not exceed 50 characters'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('productImage')
    .optional()
    .trim()
    .isURL()
    .withMessage('Product image must be a valid URL'),
  
  handleValidationErrors
];

/**
 * Bar item validation
 */
export const validateBarItem = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['beer', 'wine', 'spirits', 'cocktail', 'mocktail', 'shake', 'soft_drink', 'juice', 'water', 'smoke', 'other'])
    .withMessage('Invalid category. Must be one of: beer, wine, spirits, cocktail, mocktail, shake, soft_drink, juice, water, smoke, other'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand must not exceed 50 characters'),
  
  body('volume')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Volume must not exceed 20 characters'),
  
  body('alcoholContent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alcohol content must be between 0 and 100'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('reorderLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  
  body('productImage')
    .optional()
    .trim()
    .isURL()
    .withMessage('Product image must be a valid URL'),
  
  handleValidationErrors
];

/**
 * Batch order validation
 */
export const validateBatchOrder = [
  body('sources')
    .isArray({ min: 1 })
    .withMessage('Batch must contain at least one source'),
  
  body('sources.*.sourceId')
    .notEmpty()
    .withMessage('Source ID is required')
    .isString()
    .withMessage('Source ID must be a string'),
  
  body('sources.*.sourceName')
    .notEmpty()
    .withMessage('Source name is required')
    .isString()
    .withMessage('Source name must be a string'),
  
  body('sources.*.sourceType')
    .notEmpty()
    .withMessage('Source type is required')
    .isIn(['room', 'table', 'facility'])
    .withMessage('Source type must be room, table, or facility'),
  
  body('sources.*.orders')
    .isArray({ min: 1 })
    .withMessage('Each source must contain at least one order'),
  
  body('sources.*.orders.*.id')
    .notEmpty()
    .withMessage('Order item ID is required')
    .isUUID()
    .withMessage('Invalid order item ID'),
  
  body('sources.*.orders.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  body('sources.*.total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Source total must be a non-negative number'),
  
  body('sources.*.orders.*.specialInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 }),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }),
  
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
    
  body('tableNumber').optional().trim(),
  
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
 * UUID or Batch ID parameter validation
 */
export const validateUUIDOrBatchId = [
  param('id')
    .custom((value) => {
      // Check if it's a UUID
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        return true;
      }
      
      // Check if it's a batch ID format (BATCH-YYMMDD-HHMMSS-XXX)
      if (/^BATCH-\d{6}-\d{6}-\d{3}$/.test(value)) {
        return true;
      }
      
      throw new Error('Invalid ID format. Must be a valid UUID or batch ID (e.g., BATCH-260102-061628-252)');
    }),
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

/**
 * Status Update Validation
 */
export const validateStatusUpdate = [
  body('status').trim().notEmpty().withMessage('Status is required').isIn(['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'active', 'inactive']),
  handleValidationErrors
];

/**
 * Batch Status Update Validation
 */
export const validateBatchStatusUpdate = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'processing', 'completed', 'cancelled'])
    .withMessage('Invalid batch status. Must be one of: pending, processing, completed, cancelled'),
  handleValidationErrors
];

/**
 * Batch Order Edit Validation
 */
export const validateBatchOrderEdit = [
  body('action')
    .trim()
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['increase', 'reduce', 'remove', 'add'])
    .withMessage('Action must be one of: increase, reduce, remove, add'),
  
  body('menuItemId')
    .trim()
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isUUID()
    .withMessage('Menu item ID must be a valid UUID'),
  
  body('quantity')
    .trim()
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Reason must be between 3 and 200 characters'),
  
  handleValidationErrors
];

/**
 * Payment Validation
 */
export const validatePayment = [
  body('paymentMethod').trim().notEmpty().withMessage('Payment method is required').isIn(['cash', 'card', 'room_charge', 'mobile_money']),
  handleValidationErrors
];

/**
 * Guest validation
 */
export const validateGuest = [
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
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('idType')
    .trim()
    .notEmpty()
    .withMessage('ID type is required')
    .isIn(['passport', 'drivers_license', 'national_id'])
    .withMessage('ID type must be passport, drivers_license, or national_id'),
  
  body('idNumber')
    .trim()
    .notEmpty()
    .withMessage('ID number is required')
    .isLength({ max: 50 })
    .withMessage('ID number must not exceed 50 characters'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City must not exceed 50 characters'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country must not exceed 50 characters'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      if (age < 0 || age > 120) {
        throw new Error('Date of birth must be between 0 and 120 years ago');
      }
      return true;
    }),
  
  body('nationality')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Nationality must not exceed 50 characters'),
  
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  
  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateStaffRegistration,
  validateAdminRegistration,
  validateLogin,
  validateReservation,
  validateRestaurantOrder,
  validateMenuItem,
  validateBarItem,
  validateBarOrder,
  validateBatchOrder,
  validateUUID,
  validateUUIDOrBatchId,
  validateDateRange,
  validatePasswordChange,
  validateDepartment,
  validateInventoryItem,
  validateBatchInventoryItems,
  validateInventoryTransaction,
  validateUserUpdate,
  validateStatusUpdate,
  validateBatchStatusUpdate,
  validateBatchOrderEdit,
  validatePayment,
  validateGuest
};
