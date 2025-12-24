import db from '../models/index.js';

const { InventoryItem, InventoryStock, InventoryAllocation, InventoryAddition, InventorySubtraction } = db;

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

      // Verify department exists if departmentId is provided
      if (departmentId) {
        const { Department } = db;
        const department = await Department.findByPk(departmentId);
        if (!department) throw new Error('Department not found');
        if (!department.isActive()) throw new Error('Department is not active');
      }

      // Use the existing allocateStock method to handle FIFO allocation
      await this.allocateStock(itemId, quantity);

      // Create allocation record
      const allocation = await InventoryAllocation.create({
        itemId,
        quantity,
        departmentId,
        notes
      }, { transaction: t });

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
