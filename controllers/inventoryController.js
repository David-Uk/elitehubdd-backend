import inventoryService from '../services/inventoryService.js';

class InventoryController {
  // --- Item Operations ---

  async createItem(req, res) {
    try {
      const item = await inventoryService.createItem(req.body);
      res.status(201).json({
        success: true,
        message: 'Inventory item created successfully',
        data: item
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async createBatchItems(req, res) {
    try {
      const startTime = Date.now();
      
      // Pass user information for real-time monitoring
      const options = {
        userId: req.user?.id || 'anonymous',
        sessionId: req.body.sessionId || null
      };
      
      const result = await inventoryService.createBatchItems(req.body.items, options);
      
      // Add additional performance metrics
      result.performance = {
        totalProcessingTime: Date.now() - startTime,
        averageTimePerItem: Math.round((Date.now() - startTime) / req.body.items.length),
        throughput: Math.round((result.summary.created / (Date.now() - startTime)) * 1000), // items per second
        batchSize: req.body.items.length
      };

      // Set appropriate status code based on results
      const statusCode = result.summary.created > 0 ? 201 : 400;
      
      res.status(statusCode).json({
        success: result.summary.created > 0,
        message: result.summary.created > 0 
          ? `Batch inventory items processed successfully (${result.summary.created}/${result.summary.total} created)`
          : 'No items were created. Check failed items for details.',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown',
          processingTime: result.performance.totalProcessingTime,
          sessionId: result.sessionId,
          socketUrl: '/socket.io/' // Socket.io endpoint
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        }
      });
    }
  }

  async getAllItems(req, res) {
    try {
      const filters = {
        category: req.query.category,
        search: req.query.search,
        lowStock: req.query.lowStock
      };
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await inventoryService.getAllItems(filters, pagination);
      res.status(200).json({
        success: true,
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getItemById(req, res) {
    try {
      const item = await inventoryService.getItemById(req.params.id);
      res.status(200).json({
        success: true,
        data: item
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateItem(req, res) {
    try {
      const item = await inventoryService.updateItem(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Inventory item updated successfully',
        data: item
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteItem(req, res) {
    try {
      await inventoryService.deleteItem(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Inventory item deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // --- Stock Operations ---

  async addStock(req, res) {
    try {
      const stockEntry = await inventoryService.addStock({
        ...req.body,
        inventoryItemId: req.params.itemId
      });
      res.status(201).json({
        success: true,
        message: 'Stock received successfully',
        data: stockEntry
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async allocateStock(req, res) {
    try {
      const { quantity } = req.body;
      const result = await inventoryService.allocateStock(req.params.itemId, quantity);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getItemStockHistory(req, res) {
    try {
      const history = await inventoryService.getItemStockHistory(req.params.itemId);
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // --- New Inventory Operations ---

  async createAllocation(req, res) {
    try {
      const allocation = await inventoryService.createAllocation({
        ...req.body,
        itemId: req.params.itemId
      });
      res.status(201).json({
        success: true,
        message: 'Stock allocated successfully',
        data: allocation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async createAddition(req, res) {
    try {
      const result = await inventoryService.createAddition({
        ...req.body,
        itemId: req.params.itemId
      });
      res.status(201).json({
        success: true,
        message: 'Stock added successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async createSubtraction(req, res) {
    try {
      const result = await inventoryService.createSubtraction({
        ...req.body,
        itemId: req.params.itemId
      });
      res.status(201).json({
        success: true,
        message: 'Stock subtracted successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllocations(req, res) {
    try {
      const filters = {
        department: req.query.department
      };
      const allocations = await inventoryService.getAllocations(req.params.itemId, filters);
      res.status(200).json({
        success: true,
        data: allocations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAdditions(req, res) {
    try {
      const additions = await inventoryService.getAdditions(req.params.itemId);
      res.status(200).json({
        success: true,
        data: additions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getSubtractions(req, res) {
    try {
      const filters = {
        subtractionCause: req.query.subtractionCause
      };
      const subtractions = await inventoryService.getSubtractions(req.params.itemId, filters);
      res.status(200).json({
        success: true,
        data: subtractions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getItemWithTransactions(req, res) {
    try {
      const item = await inventoryService.getItemWithTransactions(req.params.itemId);
      res.status(200).json({
        success: true,
        data: item
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // --- Department-specific Allocation Methods ---

  async getBarAllocations(req, res) {
    try {
      const allocations = await inventoryService.getAllocationsByDepartment('bar');
      res.status(200).json({
        success: true,
        data: allocations,
        meta: {
          department: 'bar',
          count: allocations.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRestaurantAllocations(req, res) {
    try {
      const allocations = await inventoryService.getAllocationsByDepartment('restaurant');
      res.status(200).json({
        success: true,
        data: allocations,
        meta: {
          department: 'restaurant',
          count: allocations.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getDepartmentAllocations(req, res) {
    try {
      const { departmentCode } = req.params;
      const allocations = await inventoryService.getAllocationsByDepartment(departmentCode);
      res.status(200).json({
        success: true,
        data: allocations,
        meta: {
          department: departmentCode,
          count: allocations.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new InventoryController();
