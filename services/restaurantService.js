import db from '../models/index.js';

const { RestaurantOrder, RestaurantOrderItem, MenuItem, Reservation, Staff } = db;

class RestaurantService {
  /**
   * Create a new restaurant order
   */
  async createOrder(orderData) {
    const { reservationId, staffId, tableNumber, orderType, items, specialInstructions } = orderData;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Batch fetch menu items
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await MenuItem.findAll({
      where: {
        id: menuItemIds
      }
    });

    // Create a map for quick lookup
    const menuItemsMap = new Map(menuItems.map(item => [item.id, item]));

    // check if all items exist
    if (menuItems.length !== new Set(menuItemIds).size) {
        // Find which one is missing
        const foundIds = menuItems.map(i => i.id);
        const missingId = menuItemIds.find(id => !foundIds.includes(id));
        throw new Error(`Menu item ${missingId} not found`);
    }

    // Calculate totals and prepare order items
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = menuItemsMap.get(item.menuItemId);
      
      if (!menuItem.isAvailable) {
        throw new Error(`Menu item ${menuItem.name} is not available`);
      }

      const totalPrice = menuItem.price * item.quantity;
      subtotal += parseFloat(totalPrice);

      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice,
        specialInstructions: item.specialInstructions
      });
    }

    // Calculate tax and service charge
    const tax = subtotal * 0.05; // 5% tax
    const serviceCharge = subtotal * 0.10; // 10% service charge
    const totalAmount = subtotal + tax + serviceCharge;

    // Create order
    const order = await RestaurantOrder.create({
      orderNumber,
      reservationId,
      staffId,
      tableNumber,
      orderType: orderType || 'dine_in',
      subtotal,
      tax,
      serviceCharge,
      totalAmount,
      specialInstructions,
      status: 'pending'
    });

    // Bulk create order items
    const itemsToCreate = orderItemsData.map(item => ({
      orderId: order.id,
      ...item
    }));

    await RestaurantOrderItem.bulkCreate(itemsToCreate);

    return await this.getOrderById(order.id);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id) {
    const order = await RestaurantOrder.findByPk(id, {
      include: [
        {
          model: RestaurantOrderItem,
          as: 'items',
          include: [{ model: MenuItem, as: 'menuItem' }]
        },
        { model: Reservation, as: 'reservation' },
        { model: Staff, as: 'staff' }
      ]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  /**
   * Get all orders with filters
   */
  async getAllOrders(filters = {}, pagination = {}) {
    const { status, orderType, startDate, endDate } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};

    if (status) where.status = status;
    if (orderType) where.orderType = orderType;
    
    if (startDate && endDate) {
      where.createdAt = {
        [db.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await RestaurantOrder.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: RestaurantOrderItem,
          as: 'items',
          include: [{ model: MenuItem, as: 'menuItem' }]
        },
        { model: Reservation, as: 'reservation' },
        { model: Staff, as: 'staff' }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    return {
      orders: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    const order = await RestaurantOrder.findByPk(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    await order.update({ status });

    return await this.getOrderById(orderId);
  }

  /**
   * Complete order payment
   */
  async completePayment(orderId, paymentMethod) {
    const order = await RestaurantOrder.findByPk(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    await order.update({
      paymentStatus: 'paid',
      paymentMethod,
      status: 'completed'
    });

    return await this.getOrderById(orderId);
  }

  /**
   * Generate unique order number
   */
  async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `RO${year}${month}${day}${random}`;
  }

  /**
   * Get menu items
   */
  async getMenuItems(filters = {}) {
    const { category, isAvailable } = filters;
    const where = {};

    if (category) where.category = category;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;

    const menuItems = await MenuItem.findAll({
      where,
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    return menuItems;
  }
}

export default new RestaurantService();
