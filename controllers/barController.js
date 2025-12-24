import barService from '../services/barService.js';

class BarController {
  /**
   * Create new order
   */
  async createOrder(req, res) {
    try {
      const orderData = {
        ...req.body,
        staffId: req.user.id
      };
      const order = await barService.createOrder(orderData);
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

      const result = await barService.getAllOrders(filters, pagination);
      
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
      const order = await barService.getOrderById(req.params.id);
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
      const order = await barService.updateOrderStatus(req.params.id, status);
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
      const order = await barService.completePayment(req.params.id, paymentMethod);
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
   * Get bar items
   */
  async getBarItems(req, res) {
    try {
      const filters = {
        category: req.query.category,
        isAvailable: req.query.isAvailable
      };
      const barItems = await barService.getBarItems(filters);
      res.status(200).json({
        success: true,
        data: barItems
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update stock
   */
  async updateStock(req, res) {
    try {
      const { quantity } = req.body;
      const barItem = await barService.updateStock(req.params.id, quantity);
      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: barItem
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new BarController();
