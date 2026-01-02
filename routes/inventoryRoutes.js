import express from 'express';
import inventoryController from '../controllers/inventoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { validateUUID, validateInventoryItem, validateBatchInventoryItems, validateInventoryTransaction } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// --- Items ---

router.post('/items',
  authorize('super_admin', 'admin'), // Restricted to Admin
  validateInventoryItem,
  invalidateCache(['/api/inventory/items*']),
  inventoryController.createItem
);

router.post('/items/batch',
  authorize('super_admin', 'admin'), // Restricted to Admin
  validateBatchInventoryItems,
  invalidateCache(['/api/inventory/items*']),
  inventoryController.createBatchItems
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
  authorize('super_admin', 'admin'),
  validateInventoryItem,
  invalidateCache(['/api/inventory/items*']),
  inventoryController.updateItem
);

router.delete('/items/:id',
  validateUUID,
  authorize('super_admin', 'admin'),
  invalidateCache(['/api/inventory/items*']),
  inventoryController.deleteItem
);

// --- Stock Management ---

// Add new stock (receive items)
router.post('/items/:itemId/stock',
  validateUUID,
  authorize('super_admin', 'admin'),
  validateInventoryTransaction,
  invalidateCache(['/api/inventory/items*']),
  inventoryController.addStock
);

// Allocate stock (use items)
router.post('/items/:itemId/allocate',
  validateUUID,
  authorize('super_admin', 'admin'), // Restricted to Admin
  validateInventoryTransaction,
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
  authorize('super_admin', 'admin'),
  validateInventoryTransaction,
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
  authorize('super_admin', 'admin'),
  validateInventoryTransaction,
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
  authorize('super_admin', 'admin'),
  validateInventoryTransaction,
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

// --- Department-specific Allocations ---

// Get all items allocated to bar
router.get('/allocations/bar',
  cache(60),
  inventoryController.getBarAllocations
);

// Get all items allocated to restaurant
router.get('/allocations/restaurant',
  cache(60),
  inventoryController.getRestaurantAllocations
);

// Get allocations by department code
router.get('/allocations/department/:departmentCode',
  cache(60),
  inventoryController.getDepartmentAllocations
);

export default router;
