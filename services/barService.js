import db from '../models/index.js';

const { BarOrder, BarOrderItem, BarItem, Reservation, Staff } = db;

// Helper function to filter staff data based on user role
const filterStaffData = (staff, user) => {
  if (!staff || !user) return staff;
  
  // Always exclude super admins unless the user is a super admin
  if (staff.role === 'super_admin' && user.role !== 'super_admin') {
    return null;
  }
  
  // If user is admin, they can only see themselves and non-admin staff
  if (user.role === 'admin') {
    return staff.id === user.id || !['super_admin', 'admin'].includes(staff.role) ? staff : null;
  }
  
  // For other roles, exclude admins and super admins
  return !['super_admin', 'admin'].includes(staff.role) ? staff : null;
};

class BarService {
  /**
   * Create a new bar order
   */
  async createOrder(orderData) {
    const { reservationId, staffId, tableNumber, orderType, items } = orderData;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Batch fetch bar items
    const barItemIds = items.map(item => item.barItemId);
    const barItems = await BarItem.findAll({
      where: {
        id: barItemIds
      }
    });

    const barItemsMap = new Map(barItems.map(item => [item.id, item]));

    // Check availability
    if (barItems.length !== new Set(barItemIds).size) {
        const foundIds = barItems.map(i => i.id);
        const missingId = barItemIds.find(id => !foundIds.includes(id));
        throw new Error(`Bar item ${missingId} not found`);
    }

    // Calculate totals and prepare updates
    let subtotal = 0;
    const orderItemsData = [];
    const stockUpdates = [];

    for (const item of items) {
      const barItem = barItemsMap.get(item.barItemId);
      
      if (!barItem.isAvailable) {
        throw new Error(`Bar item ${barItem.name} is not available`);
      }

      if (barItem.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${barItem.name}`);
      }

      const totalPrice = barItem.price * item.quantity;
      subtotal += parseFloat(totalPrice);

      orderItemsData.push({
        barItemId: item.barItemId,
        quantity: item.quantity,
        unitPrice: barItem.price,
        totalPrice
      });

      // Update stock (collect promise)
      stockUpdates.push(barItem.decrement('stock', { by: item.quantity }));
    }

    // Execute stock updates in parallel
    await Promise.all(stockUpdates);

    // Calculate tax
    const tax = subtotal * 0.05; // 5% tax
    const totalAmount = subtotal + tax;

    // Create order
    const order = await BarOrder.create({
      orderNumber,
      reservationId,
      staffId,
      tableNumber,
      orderType: orderType || 'bar',
      subtotal,
      tax,
      totalAmount,
      status: 'pending'
    });

    // Bulk create order items
    const itemsToCreate = orderItemsData.map(item => ({
      orderId: order.id,
      ...item
    }));

    await BarOrderItem.bulkCreate(itemsToCreate);

    return await this.getOrderById(order.id);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id, user = null) {
    const order = await BarOrder.findByPk(id, {
      include: [
        {
          model: BarOrderItem,
          as: 'items',
          include: [{ model: BarItem, as: 'barItem' }]
        },
        { model: Reservation, as: 'reservation' },
        { model: Staff, as: 'staff' }
      ]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Apply staff filtering if user is provided
    if (user && order.staff) {
      const filteredStaff = filterStaffData(order.staff, user);
      if (!filteredStaff) {
        // If staff is filtered out, remove the staff association
        order.staff = null;
      } else {
        order.staff = filteredStaff;
      }
    }

    return order;
  }

  /**
   * Get all orders with filters
   */
  async getAllOrders(filters = {}, pagination = {}, user = null) {
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

    const { count, rows } = await BarOrder.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: BarOrderItem,
          as: 'items',
          include: [{ model: BarItem, as: 'barItem' }]
        },
        { model: Reservation, as: 'reservation' },
        { model: Staff, as: 'staff' }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    // Apply staff filtering if user is provided
    if (user) {
      rows.forEach(order => {
        if (order.staff) {
          const filteredStaff = filterStaffData(order.staff, user);
          if (!filteredStaff) {
            order.staff = null;
          } else {
            order.staff = filteredStaff;
          }
        }
      });
    }

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
    const order = await BarOrder.findByPk(orderId);

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
    const order = await BarOrder.findByPk(orderId);

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
    
    return `BO${year}${month}${day}${random}`;
  }

  /**
   * Create new bar item
   */
  async createBarItem(itemData) {
    const { name, category, price, description, brand, volume, alcoholContent, stock, reorderLevel, productImage } = itemData;

    // Check if item with same name already exists
    const existingItem = await BarItem.findOne({
      where: { name }
    });

    if (existingItem) {
      throw new Error(`Bar item with name '${name}' already exists`);
    }

    // Create the bar item
    const barItem = await BarItem.create({
      name,
      category,
      price,
      description,
      brand,
      volume,
      alcoholContent,
      stock: stock || 0,
      reorderLevel: reorderLevel || 10,
      productImage,
      isAvailable: true
    });

    return barItem;
  }

  /**
   * Get bar items
   */
  async getBarItems(filters = {}) {
    const { category, isAvailable } = filters;
    const where = {};

    if (category) where.category = category;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;

    const barItems = await BarItem.findAll({
      where,
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    return barItems;
  }

  /**
   * Update bar item stock
   */
  async updateStock(barItemId, quantity) {
    const barItem = await BarItem.findByPk(barItemId);

    if (!barItem) {
      throw new Error('Bar item not found');
    }

    await barItem.update({
      stock: barItem.stock + quantity
    });

    return barItem;
  }
}

export default new BarService();
