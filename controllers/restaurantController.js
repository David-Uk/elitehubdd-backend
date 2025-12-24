import restaurantService from '../services/restaurantService.js';

class RestaurantController {
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
}

export default new RestaurantController();
