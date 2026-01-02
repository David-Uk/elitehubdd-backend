import db from '../models/index.js';
import { 
  startImportSession, 
  updateImportProgress, 
  addImportError, 
  addImportWarning, 
  completeImportSession, 
  broadcastInventoryUpdate, 
  generateSessionId 
} from '../config/socket.js';

const { InventoryItem, InventoryStock, InventoryAllocation, InventoryAddition, InventorySubtraction, MenuItem, BarItem } = db;

class InventoryService {
  /**
   * Create new inventory item
   */
  async createItem(itemData) {
    const existingItem = await InventoryItem.findOne({
      where: { name: itemData.name }
    });

    if (existingItem) {
      throw new Error(`Item with name ${itemData.name} already exists`);
    }

    return await InventoryItem.create(itemData);
  }

  /**
   * Create multiple inventory items in batch (Real-time optimized with Socket.io monitoring)
   */
  async createBatchItems(items, options = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Items array is required and cannot be empty');
    }

    const startTime = Date.now();
    const sessionId = options.sessionId || generateSessionId();
    const userId = options.userId || 'system';

    // Start real-time monitoring session
    startImportSession(sessionId, userId, items.length);

    const results = {
      successful: [],
      failed: [],
      summary: {
        total: items.length,
        created: 0,
        skipped: 0,
        errors: 0,
        processingTime: 0
      }
    };

    try {
      // Phase 1: Pre-validation
      updateImportProgress(sessionId, {
        currentPhase: 'validation',
        status: 'processing',
        processedCount: 0
      });

      const validatedItems = [];
      const validationErrors = [];

      for (let i = 0; i < items.length; i++) {
        const itemData = items[i];
        
        // Quick validation
        if (!itemData.name || !itemData.category || !itemData.sku) {
          const error = {
            index: i,
            item: itemData,
            error: 'Missing required fields: name, category, sku',
            type: 'validation'
          };
          validationErrors.push(error);
          addImportError(sessionId, error);
          continue;
        }

        validatedItems.push({
          ...itemData,
          index: i
        });

        // Update progress
        updateImportProgress(sessionId, {
          processedCount: i + 1,
          currentPhase: 'validation'
        });
      }

      // Add validation errors to failed results
      results.failed.push(...validationErrors);
      results.summary.errors += validationErrors.length;

      if (validatedItems.length === 0) {
        results.summary.processingTime = Date.now() - startTime;
        completeImportSession(sessionId, results);
        return { ...results, sessionId };
      }

      // Phase 2: Duplicate detection
      updateImportProgress(sessionId, {
        currentPhase: 'duplicate_check',
        status: 'processing',
        processedCount: 0
      });

      const names = validatedItems.map(item => item.name);
      const skus = validatedItems.map(item => item.sku);

      const [existingNames, existingSKUs] = await Promise.all([
        InventoryItem.findAll({
          where: { name: { [db.Sequelize.Op.in]: names } },
          attributes: ['name'],
          raw: true
        }),
        InventoryItem.findAll({
          where: { sku: { [db.Sequelize.Op.in]: skus } },
          attributes: ['sku'],
          raw: true
        })
      ]);

      const existingNameSet = new Set(existingNames.map(item => item.name));
      const existingSKUSet = new Set(existingSKUs.map(item => item.sku));

      // Separate items to create vs duplicates
      const itemsToCreate = [];
      const duplicates = [];

      for (const item of validatedItems) {
        if (existingNameSet.has(item.name)) {
          const duplicate = {
            index: item.index,
            item: item,
            error: `Item with name "${item.name}" already exists`,
            type: 'duplicate'
          };
          duplicates.push(duplicate);
          addImportWarning(sessionId, duplicate);
        } else if (existingSKUSet.has(item.sku)) {
          const duplicate = {
            index: item.index,
            item: item,
            error: `Item with SKU "${item.sku}" already exists`,
            type: 'duplicate'
          };
          duplicates.push(duplicate);
          addImportWarning(sessionId, duplicate);
        } else {
          itemsToCreate.push(item);
        }

        // Update progress
        updateImportProgress(sessionId, {
          processedCount: (duplicates.length + itemsToCreate.length),
          currentPhase: 'duplicate_check'
        });
      }

      // Add duplicates to failed results
      results.failed.push(...duplicates);
      results.summary.skipped += duplicates.length;

      // Phase 3: Bulk creation
      if (itemsToCreate.length > 0) {
        updateImportProgress(sessionId, {
          currentPhase: 'creation',
          status: 'processing',
          processedCount: 0
        });

        try {
          // Remove index field before creation
          const cleanItems = itemsToCreate.map(item => {
            const { index, ...cleanItem } = item;
            // Store original index for tracking if needed later
            cleanItem.originalIndex = index;
            return cleanItem;
          });
          
          // Bulk create for better performance
          const createdItems = await InventoryItem.bulkCreate(cleanItems, {
            validate: false, // Skip validation since we already validated
            returning: true
          });

          results.successful.push(...createdItems);
          results.summary.created += createdItems.length;

          // Update progress for each created item
          for (let i = 0; i < createdItems.length; i++) {
            updateImportProgress(sessionId, {
              processedCount: i + 1,
              successCount: i + 1,
              currentPhase: 'creation'
            });
          }

          // Broadcast inventory update
          broadcastInventoryUpdate({
            type: 'bulk_items_created',
            count: createdItems.length,
            items: createdItems.map(item => ({
              id: item.id,
              name: item.name,
              category: item.category,
              sku: item.sku
            }))
          });

        } catch (error) {
          // If bulk create fails, fall back to individual creation
          console.warn('Bulk create failed, falling back to individual creation:', error.message);
          
          addImportWarning(sessionId, {
            message: 'Bulk creation failed, switching to individual processing',
            type: 'system'
          });
          
          for (let i = 0; i < itemsToCreate.length; i++) {
            const item = itemsToCreate[i];
            try {
              const cleanItem = { ...item };
              delete cleanItem.index;
              
              const createdItem = await InventoryItem.create(cleanItem);
              results.successful.push(createdItem);
              results.summary.created++;

              updateImportProgress(sessionId, {
                processedCount: results.summary.created + results.summary.skipped + results.summary.errors,
                successCount: results.summary.created,
                currentPhase: 'creation'
              });

            } catch (error) {
              const creationError = {
                index: item.index,
                item: item,
                error: error.message,
                type: 'creation'
              };
              results.failed.push(creationError);
              results.summary.errors++;
              addImportError(sessionId, creationError);
            }
          }
        }
      }

      results.summary.processingTime = Date.now() - startTime;

      // Complete the session
      completeImportSession(sessionId, results);

      return { ...results, sessionId };

    } catch (error) {
      // Handle any unexpected errors
      addImportError(sessionId, {
        message: error.message,
        type: 'system'
      });
      
      completeImportSession(sessionId, {
        ...results,
        summary: {
          ...results.summary,
          processingTime: Date.now() - startTime
        }
      });

      throw error;
    }
  }

  /**
   * Get all inventory items with pagination and filters
   */
  async getAllItems(filters = {}, pagination = {}) {
    const { category, search, lowStock } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (search) {
      where.name = { [db.Sequelize.Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await InventoryItem.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: InventoryStock,
        as: 'stockEntries',
        where: { inStock: true },
        required: false // Left join to include items with no stock
      }],
      order: [['name', 'ASC']],
      distinct: true
    });

    // Calculate total stock for each item
    const itemsWithStockConfig = rows.map(item => {
      const itemJson = item.toJSON();
      const totalStock = item.stockEntries.reduce((sum, entry) => sum + entry.availableQuantity, 0);
      return {
        ...itemJson,
        totalStock,
        isLowStock: totalStock <= item.reorderLevel
      };
    });

    // Filter low stock if requested (doing this in memory since it depends on aggregation)
    let resultItems = itemsWithStockConfig;
    let resultCount = count;
    
    if (lowStock === 'true') {
      resultItems = itemsWithStockConfig.filter(i => i.isLowStock);
      resultCount = resultItems.length;
    }

    return {
      items: resultItems,
      meta: {
        total: resultCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(resultCount / limit)
      }
    };
  }

  /**
   * Get item by ID
   */
  async getItemById(id) {
    const item = await InventoryItem.findByPk(id, {
      include: [{
        model: InventoryStock,
        as: 'stockEntries',
        order: [['dateReceived', 'DESC']]
      }]
    });

    if (!item) {
      throw new Error('Inventory item not found');
    }

    const itemJson = item.toJSON();
    const totalStock = item.stockEntries.reduce((sum, entry) => 
      entry.inStock ? sum + entry.availableQuantity : sum, 0
    );

    return {
      ...itemJson,
      totalStock
    };
  }

  /**
   * Update item
   */
  async updateItem(id, updateData) {
    const item = await InventoryItem.findByPk(id);

    if (!item) {
      throw new Error('Inventory item not found');
    }

    return await item.update(updateData);
  }

  /**
   * Delete item
   */
  async deleteItem(id) {
    const item = await InventoryItem.findByPk(id);

    if (!item) {
      throw new Error('Inventory item not found');
    }

    // Check if there's active stock
    const stockCount = await InventoryStock.count({
      where: {
        inventoryItemId: id,
        inStock: true
      }
    });

    if (stockCount > 0) {
      throw new Error('Cannot delete item with active stock');
    }

    return await item.destroy();
  }

  // Stock Operations

  /**
   * Add new stock (Receive items)
   */
  async addStock(stockData) {
    const { inventoryItemId, quantityReceived } = stockData;

    const item = await InventoryItem.findByPk(inventoryItemId);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    return await InventoryStock.create({
      ...stockData,
      dateReceived: stockData.dateReceived || new Date(),
      availableQuantity: quantityReceived,
      inStock: true
    });
  }

  /**
   * Allocate stock (Use items)
   * FIFO Strategy: Use oldest available batch first
   */
  async allocateStock(inventoryItemId, quantity) {
    const t = await db.sequelize.transaction();

    try {
      const item = await InventoryItem.findByPk(inventoryItemId);
      if (!item) throw new Error('Inventory item not found');

      // Find available batches ordered by receipt date (FIFO)
      const batches = await InventoryStock.findAll({
        where: {
          inventoryItemId,
          inStock: true,
          availableQuantity: { [db.Sequelize.Op.gt]: 0 }
        },
        order: [['dateReceived', 'ASC']],
        transaction: t
      });

      let remainingToAllocate = quantity;
      const allocations = [];

      // Calculate total available
      const totalAvailable = batches.reduce((sum, b) => sum + b.availableQuantity, 0);
      if (totalAvailable < quantity) {
        throw new Error(`Insufficient stock. Requested: ${quantity}, Available: ${totalAvailable}`);
      }

      for (const batch of batches) {
        if (remainingToAllocate <= 0) break;

        const take = Math.min(batch.availableQuantity, remainingToAllocate);
        
        await batch.update({
          quantityAllocated: batch.quantityAllocated + take,
          // Hooks will handle availableQuantity and inStock update
        }, { transaction: t });

        remainingToAllocate -= take;
        allocations.push({
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          quantityTaken: take
        });
      }

      await t.commit();
      return {
        success: true,
        message: 'Stock allocated successfully',
        allocations
      };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Get stock history/details for an item
   */
  async getItemStockHistory(inventoryItemId) {
    return await InventoryStock.findAll({
      where: { inventoryItemId },
      order: [['dateReceived', 'DESC']]
    });
  }

  // --- New Inventory Operations ---

  /**
   * Create an allocation record and update stock
   * This allocates stock to a specific department
   */
  async createAllocation(allocationData) {
    const { itemId, quantity, departmentId, notes } = allocationData;
    const t = await db.sequelize.transaction();

    try {
      // Verify item exists
      const item = await InventoryItem.findByPk(itemId);
      if (!item) throw new Error('Inventory item not found');

      let targetDepartmentCode = null;

      // Verify department exists if departmentId is provided
      if (departmentId) {
        const { Department } = db;
        const department = await Department.findByPk(departmentId);
        if (!department) throw new Error('Department not found');
        if (!department.isActive()) throw new Error('Department is not active');
        targetDepartmentCode = department.code.toLowerCase();
      }

      // Use the existing allocateStock method to handle FIFO allocation
      // This reduces the inventory stock
      await this.allocateStock(itemId, quantity);

      // Create allocation record
      const allocation = await InventoryAllocation.create({
        itemId,
        quantity,
        departmentId,
        notes
      }, { transaction: t });

      // --- AUTOMATIC TRANSFER LOGIC ---
      if (targetDepartmentCode) {
        if (targetDepartmentCode === 'restaurant') {
           // const { MenuItem } = db; // Removed to use top-level
           let menuItem = await MenuItem.findOne({ where: { name: item.name }, transaction: t });
           
           if (menuItem) {
             // Update existing item stock
             await menuItem.increment('stock', { by: quantity, transaction: t });
           } else {
             // Create new menu item
             // Map category if possible, else default
             const categoryMap = {
               'food': 'main_course',
               'drink': 'beverage',
               'beverage': 'beverage'
             };
             // Simple heuristic or default
             const mappedCategory = categoryMap[item.category.toLowerCase()] || 'main_course';
             
             await MenuItem.create({
               name: item.name,
               description: item.description,
               price: item.sellingPrice, // Use selling price from inventory
               cost: item.costPrice,
               category: mappedCategory, 
               stock: quantity,
               isAvailable: true
             }, { transaction: t });
           }
        } 
        else if (targetDepartmentCode === 'bar' || targetDepartmentCode === 'restaurant_bar') { // Assuming 'bar' or similar code
           // const { BarItem } = db; // Removed to use top-level
           let barItem = await BarItem.findOne({ where: { name: item.name }, transaction: t });

           if (barItem) {
             await barItem.increment('stock', { by: quantity, transaction: t });
           } else {
             const categoryMap = {
               'drink': 'other',
               'beverage': 'soft_drink',
               'alcohol': 'spirits',
               'beer': 'beer',
               'wine': 'wine'
             };
             const mappedCategory = categoryMap[item.category.toLowerCase()] || 'other';

             await BarItem.create({
               name: item.name,
               description: item.description,
               price: item.sellingPrice,
               cost: item.costPrice,
               category: mappedCategory,
               stock: quantity,
               isAvailable: true
             }, { transaction: t });
           }
        }
      }

      await t.commit();
      return allocation;

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Create an addition record and add stock
   * This adds new stock to inventory
   */
  async createAddition(additionData) {
    const { itemId, quantity, supplier, batchNumber, expiryDate, notes } = additionData;
    const t = await db.sequelize.transaction();

    try {
      // Verify item exists
      const item = await InventoryItem.findByPk(itemId);
      if (!item) throw new Error('Inventory item not found');

      // Create stock entry
      const stockEntry = await InventoryStock.create({
        inventoryItemId: itemId,
        quantityReceived: quantity,
        availableQuantity: quantity,
        supplier,
        batchNumber,
        expiryDate,
        dateReceived: new Date(),
        inStock: true
      }, { transaction: t });

      // Create addition record
      const addition = await InventoryAddition.create({
        itemId,
        quantity,
        supplier,
        batchNumber,
        expiryDate,
        notes
      }, { transaction: t });

      await t.commit();
      return {
        addition,
        stockEntry
      };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Create a subtraction record and reduce stock
   * This handles stock reduction due to damage, expiry, loss, etc.
   */
  async createSubtraction(subtractionData) {
    const { itemId, quantity, subtractionCause, notes } = subtractionData;
    const t = await db.sequelize.transaction();

    try {
      // Verify item exists
      const item = await InventoryItem.findByPk(itemId);
      if (!item) throw new Error('Inventory item not found');

      // Find available batches ordered by receipt date (FIFO)
      const batches = await InventoryStock.findAll({
        where: {
          inventoryItemId: itemId,
          inStock: true,
          availableQuantity: { [db.Sequelize.Op.gt]: 0 }
        },
        order: [['dateReceived', 'ASC']],
        transaction: t
      });

      let remainingToSubtract = quantity;
      const subtractions = [];

      // Calculate total available
      const totalAvailable = batches.reduce((sum, b) => sum + b.availableQuantity, 0);
      if (totalAvailable < quantity) {
        throw new Error(`Insufficient stock. Requested: ${quantity}, Available: ${totalAvailable}`);
      }

      // Subtract from batches using FIFO
      for (const batch of batches) {
        if (remainingToSubtract <= 0) break;

        const take = Math.min(batch.availableQuantity, remainingToSubtract);
        
        // Reduce available quantity directly (not allocated)
        await batch.update({
          quantityReceived: batch.quantityReceived - take,
          // Hooks will handle availableQuantity and inStock update
        }, { transaction: t });

        remainingToSubtract -= take;
        subtractions.push({
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          quantitySubtracted: take
        });
      }

      // Create subtraction record
      const subtraction = await InventorySubtraction.create({
        itemId,
        quantity,
        subtractionCause,
        notes
      }, { transaction: t });

      await t.commit();
      return {
        subtraction,
        subtractions
      };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Get all allocations for an item
   */
  async getAllocations(itemId, filters = {}) {
    const where = { itemId };
    if (filters.departmentId) where.departmentId = filters.departmentId;

    return await InventoryAllocation.findAll({
      where,
      include: [
        {
          model: InventoryItem,
          as: 'item',
          attributes: ['id', 'name', 'category', 'unit']
        },
        {
          model: db.Department,
          as: 'departmentInfo',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get all allocations for a specific department by code
   */
  async getAllocationsByDepartment(departmentCode) {
    const { Department } = db;
    
    // Find department by code
    const department = await Department.findOne({
      where: { 
        code: departmentCode,
        status: 'active'
      }
    });

    if (!department) {
      throw new Error(`Department with code '${departmentCode}' not found or inactive`);
    }

    // Get all allocations for this department
    return await InventoryAllocation.findAll({
      where: { departmentId: department.id },
      include: [
        {
          model: InventoryItem,
          as: 'item',
          attributes: ['id', 'name', 'category', 'sku', 'unit', 'description']
        },
        {
          model: Department,
          as: 'departmentInfo',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get all additions for an item
   */
  async getAdditions(itemId) {
    return await InventoryAddition.findAll({
      where: { itemId },
      include: [{
        model: InventoryItem,
        as: 'item',
        attributes: ['id', 'name', 'category', 'unit']
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get all subtractions for an item
   */
  async getSubtractions(itemId, filters = {}) {
    const where = { itemId };
    if (filters.subtractionCause) where.subtractionCause = filters.subtractionCause;

    return await InventorySubtraction.findAll({
      where,
      include: [{
        model: InventoryItem,
        as: 'item',
        attributes: ['id', 'name', 'category', 'unit']
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get comprehensive item details including all transactions
   */
  async getItemWithTransactions(itemId) {
    const item = await InventoryItem.findByPk(itemId, {
      include: [
        {
          model: InventoryStock,
          as: 'stockEntries',
          order: [['dateReceived', 'DESC']]
        },
        {
          model: InventoryAllocation,
          as: 'allocations',
          order: [['createdAt', 'DESC']],
          limit: 10
        },
        {
          model: InventoryAddition,
          as: 'additions',
          order: [['createdAt', 'DESC']],
          limit: 10
        },
        {
          model: InventorySubtraction,
          as: 'subtractions',
          order: [['createdAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!item) {
      throw new Error('Inventory item not found');
    }

    const itemJson = item.toJSON();
    const totalStock = item.stockEntries.reduce((sum, entry) => 
      entry.inStock ? sum + entry.availableQuantity : sum, 0
    );

    return {
      ...itemJson,
      totalStock
    };
  }
}

export default new InventoryService();
