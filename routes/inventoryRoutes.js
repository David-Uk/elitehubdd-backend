import express from 'express';
import inventoryController from '../controllers/inventoryController.js';
import { authenticate, authorize, authorizeDepartment } from '../middleware/auth.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { validateUUID } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// --- Items ---

router.post('/items',
  authorize('admin', 'manager', 'store_keeper'),
  authorizeDepartment('management'),
  invalidateCache(['/api/inventory/items*']),
  inventoryController.createItem
);

router.get('/items',
  cache(60), // Cache for 1 minute
  inventoryController.getAllItems
);

router.get('/items/:id',
  validateUUID,
  cache(60),
  inventoryController.getItemById
);

router.patch('/items/:id',
  validateUUID,
  authorize('admin', 'manager', 'store_keeper'),
  authorizeDepartment('management'),
  invalidateCache(['/api/inventory/items*']),
  inventoryController.updateItem
);

router.delete('/items/:id',
  validateUUID,
  authorize('admin', 'manager'),
  authorizeDepartment('management'),
  invalidateCache(['/api/inventory/items*']),
  inventoryController.deleteItem
);

// --- Stock Management ---

// Add new stock (receive items) - Management Only
router.post('/items/:itemId/stock',
  authorize('admin', 'manager', 'store_keeper'),
  authorizeDepartment('management'),
  invalidateCache(['/api/inventory/items*']),
  inventoryController.addStock
);

// Allocate stock (use items) - Can trigger allocation request, but maybe restricted?
// Request said "The inventory should be handled only a staff with management department"
// So allocation (reducing stock) should also be management only?
// Or maybe other departments can REQUEST allocation?
// For now, restricting strict inventory updates to management.
router.post('/items/:itemId/allocate',
  authorizeDepartment('management'),
  invalidateCache(['/api/inventory/items*']),
  inventoryController.allocateStock
);

// Get stock history
router.get('/items/:itemId/history',
  validateUUID,
  cache(60),
  inventoryController.getItemStockHistory
);

// --- New Inventory Operations ---

// Create allocation - Allocate stock to a department
router.post('/items/:itemId/allocations',
  validateUUID,
  authorize('admin', 'manager', 'store_keeper'),
  authorizeDepartment('management'),
  invalidateCache(['/api/inventory/items*']),
  inventoryController.createAllocation
);

// Get allocations for an item
router.get('/items/:itemId/allocations',
  validateUUID,
  cache(60),
  inventoryController.getAllocations
);

// Create addition - Add new stock
router.post('/items/:itemId/additions',
  validateUUID,
  authorize('admin', 'manager', 'store_keeper'),
  authorizeDepartment('management'),
  invalidateCache(['/api/inventory/items*']),
  inventoryController.createAddition
);

// Get additions for an item
router.get('/items/:itemId/additions',
  validateUUID,
  cache(60),
  inventoryController.getAdditions
);

// Create subtraction - Reduce stock (damage, loss, etc.)
router.post('/items/:itemId/subtractions',
  validateUUID,
  authorize('admin', 'manager', 'store_keeper'),
  authorizeDepartment('management'),
  invalidateCache(['/api/inventory/items*']),
  inventoryController.createSubtraction
);

// Get subtractions for an item
router.get('/items/:itemId/subtractions',
  validateUUID,
  cache(60),
  inventoryController.getSubtractions
);

// Get item with all transactions (comprehensive view)
router.get('/items/:itemId/transactions',
  validateUUID,
  cache(60),
  inventoryController.getItemWithTransactions
);

export default router;
