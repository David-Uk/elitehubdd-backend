import restaurantService from '../services/restaurantService.js';

class RestaurantController {
  /**
   * Get all batch orders
   */
  async getAllBatchOrders(req, res) {
    try {
      const batches = await restaurantService.getAllBatchOrders(req.query);
      res.status(200).json({
        success: true,
        data: batches
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create batch order with multiple sources
   */
  async createBatchOrder(req, res) {
    try {
      const batchData = {
        ...req.body,
        staffId: req.user.id
      };
      const batch = await restaurantService.createBatchOrder(batchData);
      res.status(201).json({
        success: true,
        message: 'Batch order created successfully',
        data: batch
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create new order
   */
  async createOrder(req, res) {
    try {
      const orderData = {
        ...req.body,
        staffId: req.user.id
      };
      const order = await restaurantService.createOrder(orderData);
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all orders
   */
  async getAllOrders(req, res) {
    try {
      const filters = {
        status: req.query.status,
        orderType: req.query.orderType,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await restaurantService.getAllOrders(filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.orders,
        meta: result.meta
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(req, res) {
    try {
      const order = await restaurantService.getOrderById(req.params.id);
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const order = await restaurantService.updateOrderStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Complete payment
   */
  async completePayment(req, res) {
    try {
      const { paymentMethod } = req.body;
      const order = await restaurantService.completePayment(req.params.id, paymentMethod);
      res.status(200).json({
        success: true,
        message: 'Payment completed successfully',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create new menu item
   */
  async createMenuItem(req, res) {
    try {
      const menuItem = await restaurantService.createMenuItem(req.body);
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        data: menuItem
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get menu items
   */
  async getMenuItems(req, res) {
    try {
      const filters = {
        category: req.query.category,
        isAvailable: req.query.isAvailable
      };
      const menuItems = await restaurantService.getMenuItems(filters);
      res.status(200).json({
        success: true,
        data: menuItems
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create new batch
   */
  async createBatch(req, res) {
    try {
      const batchData = {
        ...req.body,
        staffId: req.user.id
      };
      const batch = await restaurantService.createBatch(batchData);
      res.status(201).json({
        success: true,
        message: 'Batch created successfully',
        data: batch
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get batch by ID
   */
  async getBatchById(req, res) {
    try {
      const batch = await restaurantService.getBatchById(req.params.id);
      res.status(200).json({
        success: true,
        data: batch
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all batches
   */
  async getAllBatches(req, res) {
    try {
      const filters = {
        status: req.query.status,
        staffId: req.query.staffId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await restaurantService.getAllBatches(filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.batches,
        meta: result.meta
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get batches by date
   */
  async getBatchesByDate(req, res) {
    try {
      const { date } = req.params;
      const { staffId } = req.query;
      
      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date parameter is required'
        });
      }

      const batches = await restaurantService.getBatchesByDate(date, staffId);
      res.status(200).json({
        success: true,
        data: batches
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Add order to batch
   */
  async addOrderToBatch(req, res) {
    try {
      const { batchId } = req.params;
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      const batch = await restaurantService.addOrderToBatch(batchId, orderId);
      res.status(200).json({
        success: true,
        message: 'Order added to batch successfully',
        data: batch
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update batch status
   */
  async updateBatchStatus(req, res) {
    try {
      const { status } = req.body;
      const batch = await restaurantService.updateBatchStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        message: 'Batch status updated successfully',
        data: batch
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Complete batch
   */
  async completeBatch(req, res) {
    try {
      const { paymentMethod } = req.body;
      const batch = await restaurantService.completeBatch(req.params.id, paymentMethod);
      res.status(200).json({
        success: true,
        message: 'Batch completed successfully',
        data: batch
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Cancel batch
   */
  async cancelBatch(req, res) {
    try {
      const { reason } = req.body;
      const batch = await restaurantService.cancelBatch(req.params.id, reason);
      res.status(200).json({
        success: true,
        message: 'Batch cancelled successfully',
        data: batch
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Edit batch order items
   */
  async editBatchOrder(req, res) {
    try {
      const editData = {
        ...req.body,
        staffId: req.user.id
      };
      const batch = await restaurantService.editBatchOrder(req.params.id, editData);
      res.status(200).json({
        success: true,
        message: 'Batch order updated successfully',
        data: batch
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete all restaurant orders (Super Admin only)
   */
  async deleteAllOrders(req, res) {
    try {
      await restaurantService.deleteAllOrders();
      res.status(200).json({
        success: true,
        message: 'All restaurant orders and related data have been deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new RestaurantController();
