import db from '../models/index.js';

const { RestaurantOrder, RestaurantOrderItem, MenuItem, Reservation, Staff, OrderBatch, BatchSource } = db;

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

class RestaurantService {
  /**
   * Generate unique batch ID
   */
  async generateBatchId() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `BATCH-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
  }

  /**
   * Find batch by UUID or batchId
   */
  async findBatchByIdentifier(identifier, options = {}) {
    // Try to find by UUID first
    let batch = await OrderBatch.findByPk(identifier, options);
    
    // If not found, try to find by batchId field
    if (!batch) {
      batch = await OrderBatch.findOne({
        where: { batchId: identifier },
        ...options
      });
    }
    
    return batch;
  }

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
  async getOrderById(id, user = null) {
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

    return { count, rows };
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
   * Create new menu item
   */
  async createMenuItem(itemData) {
    const { 
      name, 
      category, 
      price, 
      description, 
      cost, 
      preparationTime, 
      cuisine, 
      isVegetarian, 
      isVegan, 
      allergens, 
      stock, 
      productImage 
    } = itemData;

    // Check if item with same name already exists
    const existingItem = await MenuItem.findOne({
      where: { name }
    });

    if (existingItem) {
      throw new Error(`Menu item with name '${name}' already exists`);
    }

    // Create the menu item
    const menuItem = await MenuItem.create({
      name,
      category,
      price,
      description,
      cost,
      preparationTime,
      cuisine,
      isVegetarian: isVegetarian || false,
      isVegan: isVegan || false,
      allergens: allergens || [],
      stock: stock || 0,
      productImage,
      isAvailable: true
    });

    return menuItem;
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

  /**
   * Get all batch orders
   */
  async getAllBatchOrders(filters = {}) {
    const { Op } = db.Sequelize;
    
    // Build where clause from filters
    const whereClause = {};
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.date) {
      const startDate = new Date(filters.date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    if (filters.startDate && filters.endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    }
    
    if (filters.batchId) {
      whereClause.batchId = {
        [Op.like]: `%${filters.batchId}%`
      };
    }

    const batches = await OrderBatch.findAll({
      where: whereClause,
      include: [
      {
        model: RestaurantOrder,
        as: 'orders',
        include: [
          {
            model: RestaurantOrderItem,
            as: 'items',
            include: [{ model: MenuItem, as: 'menuItem' }]
          },
          { model: Reservation, as: 'reservation' },
          { model: BatchSource, as: 'batchSource' }
        ]
      },
      {
        model: Staff,
        as: 'staff',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: BatchSource,
        as: 'sources',
        include: [
          {
            model: RestaurantOrder,
            as: 'orders',
            include: [
              {
                model: RestaurantOrderItem,
                as: 'items',
                include: [{ model: MenuItem, as: 'menuItem' }]
              },
              { model: BatchSource, as: 'batchSource' }
            ]
          }
        ]
      }
    ],
      order: [['createdAt', 'DESC']]
    });

    return batches;
  }

  /**
   * Create batch order with multiple sources
   */
  async createBatchOrder(batchData) {
    const { sources, notes } = batchData;
    const { OrderBatch, BatchSource, RestaurantOrder, MenuItem, RestaurantOrderItem } = db;

    // Generate unique batch ID
    const batchId = await this.generateBatchId();

    // Create batch
    const batch = await OrderBatch.create({
      batchId,
      staffId: batchData.staffId,
      notes,
      status: 'pending',
      totalItems: 0,
      totalAmount: 0,
      tax: 0,
      serviceCharge: 0
    });

    let totalItems = 0;
    let totalAmount = 0;
    let totalTax = 0;
    let totalServiceCharge = 0;

    // Process each source
    for (const source of sources) {
      // Create batch source
      const batchSource = await BatchSource.create({
        batchId: batch.id,
        sourceId: source.sourceId,
        sourceName: source.sourceName,
        sourceType: source.sourceType,
        total: source.total || 0
      });

      // Get menu items for validation
      const menuItemIds = source.orders.map(order => order.id);
      const menuItems = await MenuItem.findAll({
        where: { id: menuItemIds }
      });
      const menuItemsMap = new Map(menuItems.map(item => [item.id, item]));

      // Validate all items exist
      if (menuItems.length !== new Set(menuItemIds).size) {
        const foundIds = menuItems.map(i => i.id);
        const missingId = menuItemIds.find(id => !foundIds.includes(id));
        throw new Error(`Menu item ${missingId} not found`);
      }

      // Create orders for this source
      for (const orderData of source.orders) {
        const menuItem = menuItemsMap.get(orderData.id);
        if (!menuItem) {
          throw new Error(`Menu item ${orderData.id} not found`);
        }

        const totalPrice = menuItem.price * orderData.quantity;
        const tax = totalPrice * 0.05;
        const serviceCharge = totalPrice * 0.10;
        const amountWithCharges = totalPrice + tax + serviceCharge;

        totalItems += orderData.quantity;
        totalAmount += amountWithCharges;
        totalTax += tax;
        totalServiceCharge += serviceCharge;

        // Create restaurant order
        const order = await RestaurantOrder.create({
          orderNumber: await this.generateOrderNumber(),
          staffId: batchData.staffId,
          batchId: batch.id,
          batchSourceId: batchSource.id,
          tableNumber: source.sourceType === 'table' ? source.sourceName : null,
          orderType: source.sourceType === 'room' ? 'room_service' : 'dine_in',
          status: 'pending',
          subtotal: totalPrice,
          tax,
          serviceCharge,
          totalAmount: amountWithCharges,
          paymentStatus: 'pending',
          specialInstructions: orderData.specialInstructions
        });

        // Create order items
        await RestaurantOrderItem.create({
          orderId: order.id,
          menuItemId: orderData.id,
          quantity: orderData.quantity,
          unitPrice: menuItem.price,
          totalPrice,
          specialInstructions: orderData.specialInstructions
        });
      }
    }

    // Update batch totals
    await batch.update({
      totalItems,
      totalAmount,
      tax: totalTax,
      serviceCharge: totalServiceCharge
    });

    return await this.getBatchById(batch.id);
  }

  /**
   * Create a new batch
   */
  async createBatch(batchData) {
    const { staffId, notes } = batchData;

    // Generate unique batch ID
    const batchId = await this.generateBatchId();

    const batch = await OrderBatch.create({
      batchId,
      staffId,
      notes,
      status: 'pending',
      totalItems: 0,
      totalAmount: 0,
      tax: 0,
      serviceCharge: 0
    });

    return await this.getBatchById(batch.id);
  }

  /**
   * Get batch by ID
   */
  async getBatchById(id) {
    // Find batch by either UUID or batchId
    const batch = await this.findBatchByIdentifier(id, {
      include: [
        {
          model: RestaurantOrder,
          as: 'orders',
          include: [
            {
              model: RestaurantOrderItem,
              as: 'items',
              include: [{ model: MenuItem, as: 'menuItem' }]
            },
            { model: Reservation, as: 'reservation' },
            { model: Staff, as: 'staff' },
            { model: BatchSource, as: 'batchSource' }
          ]
        },
        { model: Staff, as: 'staff' },
        {
          model: BatchSource,
          as: 'sources',
          include: [
            {
              model: RestaurantOrder,
              as: 'orders',
              include: [
                {
                  model: RestaurantOrderItem,
                  as: 'items',
                  include: [{ model: MenuItem, as: 'menuItem' }]
                },
                { model: BatchSource, as: 'batchSource' }
              ]
            }
          ]
        }
      ]
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    return batch;
  }

  /**
   * Add order to batch
   */
  async addOrderToBatch(batchId, orderId) {
    // Find batch by either UUID or batchId
    const batch = await this.findBatchByIdentifier(batchId);
    const order = await RestaurantOrder.findByPk(orderId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    if (!order) {
      throw new Error('Order not found');
    }

    // Find or create a BatchSource for this order's info
    let batchSource = await BatchSource.findOne({
      where: {
        batchId: batch.id,
        sourceId: order.tableNumber || 'general-order'
      }
    });

    if (!batchSource) {
      batchSource = await BatchSource.create({
        batchId: batch.id,
        sourceId: order.tableNumber || 'general-order',
        sourceName: order.tableNumber ? `Table ${order.tableNumber}` : 'General Order',
        sourceType: order.orderType === 'room_service' ? 'room' : 'table',
        total: 0
      });
    }

    // Update order with batch ID and source
    await order.update({ 
      batchId: batch.id,
      batchSourceId: batchSource.id
    });

    // Recalculate totals
    await this.recalculateBatchTotals(batch.id);

    return await this.getBatchById(batch.id);
  }

  /**
   * Get all batches with filters
   */
  async getAllBatches(filters = {}, pagination = {}) {
    const { status, staffId, startDate, endDate } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};

    if (status) where.status = status;
    if (staffId) where.staffId = staffId;
    
    if (startDate && endDate) {
      where.createdAt = {
        [db.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await OrderBatch.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: RestaurantOrder,
          as: 'orders',
          include: [
            {
              model: RestaurantOrderItem,
              as: 'items',
              include: [{ model: MenuItem, as: 'menuItem' }]
            },
            { model: Reservation, as: 'reservation' },
            { model: BatchSource, as: 'batchSource' }
          ]
        },
        { model: Staff, as: 'staff' },
        {
          model: BatchSource,
          as: 'sources',
          include: [
            {
              model: RestaurantOrder,
              as: 'orders',
              include: [
                {
                  model: RestaurantOrderItem,
                  as: 'items',
                  include: [{ model: MenuItem, as: 'menuItem' }]
                },
                { model: BatchSource, as: 'batchSource' }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    return {
      batches: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get batches by date
   */
  async getBatchesByDate(date, staffId = null) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where = {
      createdAt: {
        [db.Sequelize.Op.between]: [startOfDay, endOfDay]
      }
    };

    if (staffId) {
      where.staffId = staffId;
    }

    const batches = await OrderBatch.findAll({
      where,
      include: [
        {
          model: RestaurantOrder,
          as: 'orders',
          include: [
            {
              model: RestaurantOrderItem,
              as: 'items',
              include: [{ model: MenuItem, as: 'menuItem' }]
            },
            { model: Reservation, as: 'reservation' },
            { model: BatchSource, as: 'batchSource' }
          ]
        },
        { model: Staff, as: 'staff' },
        {
          model: BatchSource,
          as: 'sources',
          include: [
            {
              model: RestaurantOrder,
              as: 'orders',
              include: [
                {
                  model: RestaurantOrderItem,
                  as: 'items',
                  include: [{ model: MenuItem, as: 'menuItem' }]
                },
                { model: BatchSource, as: 'batchSource' }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return batches;
  }

  /**
   * Update batch status
   */
  async updateBatchStatus(batchId, status) {
    // Find batch by either UUID or batchId
    const batch = await this.findBatchByIdentifier(batchId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    const updateData = { status };

    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await batch.update(updateData);

    return await this.getBatchById(batch.id);
  }

/**
 * Cancel batch
 */
async cancelBatch(batchId, reason) {
  // Find batch by either UUID or batchId
  const batch = await this.findBatchByIdentifier(batchId, {
    include: [
      {
        model: RestaurantOrder,
        as: 'orders'
      }
    ]
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (batch.status === 'completed') {
    throw new Error('Cannot cancel a completed batch');
  }

  if (batch.status === 'cancelled') {
    throw new Error('Batch is already cancelled');
  }

  // Update all orders in the batch to remove batch assignment
  for (const order of batch.orders) {
    await order.update({
      batchId: null,
      status: 'cancelled'
    });
  }

  // Update batch status
  await batch.update({
    status: 'cancelled',
    notes: reason || 'Batch cancelled'
  });

  return await this.getBatchById(batch.id);
  }

  /**
   * Complete batch and process payments
   */
  async completeBatch(batchId, paymentMethod) {
    // Find batch by either UUID or batchId
    const batch = await this.findBatchByIdentifier(batchId, {
      include: [
        {
          model: RestaurantOrder,
          as: 'orders',
          include: [
            {
              model: RestaurantOrderItem,
              as: 'items',
              include: [
                {
                  model: MenuItem,
                  as: 'menuItem'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    if (batch.status === 'completed') {
      throw new Error('Batch is already completed');
    }

    if (batch.status === 'cancelled') {
      throw new Error('Cannot complete a cancelled batch');
    }

    // Update all orders in the batch to mark as paid
    for (const order of batch.orders) {
      await order.update({
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod,
        paymentDate: new Date()
      });
    }

    // Update batch status
    await batch.update({
      status: 'completed',
      completedAt: new Date()
    });

    return await this.getBatchById(batch.id);
  }

  /**
   * Edit batch order items (increase, reduce, remove, add)
   */
  async editBatchOrder(batchId, editData) {
    const { action, menuItemId, quantity, reason } = editData;

    // Find batch by either UUID or batchId
  const batch = await this.findBatchByIdentifier(batchId, {
    include: [
      {
        model: RestaurantOrder,
        as: 'orders',
        include: [
          {
            model: RestaurantOrderItem,
            as: 'items',
            where: menuItemId ? { menuItemId } : undefined,
            required: false
          },
          { model: BatchSource, as: 'batchSource' }
        ]
      },
      {
        model: BatchSource,
        as: 'sources'
      }
    ]
  });

    if (!batch) {
      throw new Error('Batch not found');
    }

    if (batch.status === 'completed' || batch.status === 'cancelled') {
      throw new Error('Cannot edit completed or cancelled batches');
    }

    switch (action) {
      case 'increase':
        await this.increaseBatchItem(batch, menuItemId, quantity, reason);
        break;
      case 'reduce':
        await this.reduceBatchItem(batch, menuItemId, quantity, reason);
        break;
      case 'remove':
        await this.removeBatchItem(batch, menuItemId, reason);
        break;
      case 'add':
        await this.addNewBatchItem(batch, menuItemId, quantity, reason);
        break;
      default:
        throw new Error('Invalid action. Must be: increase, reduce, remove, or add');
    }

    // Recalculate batch totals
    await this.recalculateBatchTotals(batch.id);

    return await this.getBatchById(batch.id);
  }

  /**
   * Increase quantity of a menu item in batch
   */
  async increaseBatchItem(batch, menuItemId, additionalQuantity, reason) {
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }

    if (!menuItem.isAvailable) {
      throw new Error(`Menu item ${menuItem.name} is not available`);
    }

    // Find existing order with this menu item
    let targetOrder = null;
    let targetItem = null;

    for (const order of batch.orders) {
      const existingItem = order.items.find(item => item.menuItemId === menuItemId);
      if (existingItem) {
        targetOrder = order;
        targetItem = existingItem;
        break;
      }
    }

    if (targetItem) {
      // Update existing item
      const newQuantity = targetItem.quantity + additionalQuantity;
      const newTotalPrice = menuItem.price * newQuantity;

      await targetItem.update({
        quantity: newQuantity,
        totalPrice: newTotalPrice,
        specialInstructions: targetItem.specialInstructions + `\n\nIncreased: ${reason} (${new Date().toISOString()})`
      });

      // Update order totals
      await this.updateOrderTotals(targetOrder.id);
    } else {
      // Link to first available source or create a general one
      let batchSourceId = batch.sources?.[0]?.id || null;
      let tableNumber = batch.sources?.[0]?.sourceName || 'Batch Edit';

      if (!batchSourceId) {
        const defaultSource = await BatchSource.create({
          batchId: batch.id,
          sourceId: 'manual-addition',
          sourceName: 'Manual Addition',
          sourceType: 'table',
          total: 0
        });
        batchSourceId = defaultSource.id;
        tableNumber = defaultSource.sourceName;
      }

      // Create new order with this item
      const newOrder = await RestaurantOrder.create({
        orderNumber: await this.generateOrderNumber(),
        staffId: batch.staffId,
        batchId: batch.id,
        batchSourceId,
        tableNumber,
        orderType: 'dine_in',
        status: 'pending',
        subtotal: menuItem.price * additionalQuantity,
        totalAmount: menuItem.price * additionalQuantity,
        paymentStatus: 'pending'
      });

      await RestaurantOrderItem.create({
        orderId: newOrder.id,
        menuItemId,
        quantity: additionalQuantity,
        unitPrice: menuItem.price,
        totalPrice: menuItem.price * additionalQuantity,
        specialInstructions: `Added during batch edit: ${reason} (${new Date().toISOString()})`
      });
    }

    return batch.orders;
  }

  /**
   * Add a completely new menu item to batch
   */
  async addNewBatchItem(batch, menuItemId, quantity, reason) {
    const menuItem = await MenuItem.findByPk(menuItemId);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }

    if (!menuItem.isAvailable) {
      throw new Error(`Menu item ${menuItem.name} is not available`);
    }

    // Check if item already exists in batch
    for (const order of batch.orders) {
      const existingItem = order.items.find(item => item.menuItemId === menuItemId);
      if (existingItem) {
        throw new Error(`Menu item ${menuItem.name} already exists in batch. Use 'increase' action instead.`);
      }
    }

    // Link to first available source or create a general one
    let batchSourceId = batch.sources?.[0]?.id || null;
    let tableNumber = batch.sources?.[0]?.sourceName || 'Batch Edit';

    if (!batchSourceId) {
      const defaultSource = await BatchSource.create({
        batchId: batch.id,
        sourceId: 'manual-addition',
        sourceName: 'Manual Addition',
        sourceType: 'table',
        total: 0
      });
      batchSourceId = defaultSource.id;
      tableNumber = defaultSource.sourceName;
    }

    // Create new order with this menu item
    const newOrder = await RestaurantOrder.create({
      orderNumber: await this.generateOrderNumber(),
      staffId: batch.staffId,
      batchId: batch.id,
      batchSourceId,
      tableNumber,
      orderType: 'dine_in',
      status: 'pending',
      subtotal: menuItem.price * quantity,
      totalAmount: menuItem.price * quantity,
      paymentStatus: 'pending',
      specialInstructions: `New item added to batch: ${reason} (${new Date().toISOString()})`
    });

    await RestaurantOrderItem.create({
      orderId: newOrder.id,
      menuItemId,
      quantity,
      unitPrice: menuItem.price,
      totalPrice: menuItem.price * quantity,
      specialInstructions: `Added to batch: ${reason} (${new Date().toISOString()})`
    });

    return batch.orders;
  }

  /**
   * Reduce quantity of a menu item in batch
   */
  async reduceBatchItem(batch, menuItemId, reduceQuantity, reason) {
    // Find existing order with this menu item
    let targetOrder = null;
    let targetItem = null;

    for (const order of batch.orders) {
      const existingItem = order.items.find(item => item.menuItemId === menuItemId);
      if (existingItem) {
        targetOrder = order;
        targetItem = existingItem;
        break;
      }
    }

    if (!targetItem) {
      throw new Error('Menu item not found in this batch');
    }

    if (targetItem.quantity <= reduceQuantity) {
      throw new Error('Cannot reduce quantity below 1. Use remove action instead.');
    }

    const newQuantity = targetItem.quantity - reduceQuantity;
    const menuItem = await MenuItem.findByPk(menuItemId);
    const newTotalPrice = menuItem.price * newQuantity;

    await targetItem.update({
      quantity: newQuantity,
      totalPrice: newTotalPrice,
      specialInstructions: targetItem.specialInstructions + `\n\nReduced: ${reason} (${new Date().toISOString()})`
    });

    // Update order totals
    await this.updateOrderTotals(targetOrder.id);

    return batch.orders;
  }

  /**
   * Remove a menu item completely from batch
   */
  async removeBatchItem(batch, menuItemId) {
    // Find existing order with this menu item
    let targetOrder = null;
    let targetItem = null;

    for (const order of batch.orders) {
      const existingItem = order.items.find(item => item.menuItemId === menuItemId);
      if (existingItem) {
        targetOrder = order;
        targetItem = existingItem;
        break;
      }
    }

    if (!targetItem) {
      throw new Error('Menu item not found in this batch');
    }

    // Remove order item
    await targetItem.destroy();

    // Check if order has any remaining items
    const remainingItems = await RestaurantOrderItem.findAll({
      where: { orderId: targetOrder.id }
    });

    if (remainingItems.length === 0) {
      // Remove entire order if no items left
      await targetOrder.destroy();
    } else {
      // Update order totals
      await this.updateOrderTotals(targetOrder.id);
    }

    return batch.orders;
  }

  /**
   * Update order totals after item modifications
   */
  async updateOrderTotals(orderId) {
    const order = await RestaurantOrder.findByPk(orderId, {
      include: [{ model: RestaurantOrderItem, as: 'items' }]
    });

    if (!order) return;

    const subtotal = order.items.reduce((sum, item) => {
      return sum + parseFloat(item.totalPrice);
    }, 0);

    const tax = subtotal * 0.05; // 5% tax
    const serviceCharge = subtotal * 0.10; // 10% service charge
    const totalAmount = subtotal + tax + serviceCharge;

    await order.update({
      subtotal,
      tax,
      serviceCharge,
      totalAmount
    });
  }

  /**
   * Recalculate batch totals after order modifications
   */
  async recalculateBatchTotals(batchId) {
    const batch = await OrderBatch.findByPk(batchId, {
      include: [
        {
          model: RestaurantOrder,
          as: 'orders',
          include: [{ model: RestaurantOrderItem, as: 'items' }]
        },
        {
          model: BatchSource,
          as: 'sources'
        }
      ]
    });

    if (!batch) return;

    // Update each source's total first
    for (const source of (batch.sources || [])) {
      const sourceOrders = batch.orders.filter(o => o.batchSourceId === source.id);
      const sourceTotal = sourceOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
      await source.update({ total: sourceTotal });
    }

    // Now calculate global batch totals
    const totalItems = batch.orders.reduce((sum, order) => {
      const items = order.items || [];
      return sum + items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const subtotal = batch.orders.reduce((sum, order) => {
      return sum + parseFloat(order.subtotal || 0);
    }, 0);

    const tax = subtotal * 0.05;
    const serviceCharge = subtotal * 0.10;
    const totalAmount = subtotal + tax + serviceCharge;

    await batch.update({
      totalItems,
      totalAmount,
      tax,
      serviceCharge
    });
  }

  /**
   * Update order item details (quantity, special instructions)
   */
  async updateOrderItem(itemId, updates) {
    const item = await RestaurantOrderItem.findByPk(itemId);
    if (!item) {
      throw new Error('Order item not found');
    }

    const { quantity, specialInstructions } = updates;
    const updateData = {};
    let recalculate = false;

    if (quantity !== undefined) {
      updateData.quantity = quantity;
      updateData.totalPrice = quantity * item.unitPrice;
      recalculate = true;
    }

    if (specialInstructions !== undefined) {
      updateData.specialInstructions = specialInstructions;
    }

    await item.update(updateData);

    if (recalculate) {
      await this.updateOrderTotals(item.orderId);
      // Also need to update batch totals if belongs to one
      const order = await RestaurantOrder.findByPk(item.orderId);
      if (order && order.batchId) {
        await this.recalculateBatchTotals(order.batchId);
      }
    }

    return item;
  }

  /**
   * Update order item status and propagate completion
   */
  async updateOrderItemStatus(itemId, status) {
    const item = await RestaurantOrderItem.findByPk(itemId);
    if (!item) {
      throw new Error('Order item not found');
    }

    await item.update({ status });

    // Check if we need to update order status
    if (['completed', 'served', 'cancelled'].includes(status)) {
      await this.checkOrderCompletion(item.orderId);
    }

    // Only return the item with fresh data if needed, or just the item
    return item;
  }

  /**
   * Check if order is complete based on its items
   */
  async checkOrderCompletion(orderId) {
    const order = await RestaurantOrder.findByPk(orderId, {
      include: [{ model: RestaurantOrderItem, as: 'items' }]
    });

    if (!order) return;

    // Filter out cancelled items from completion check, or assume they don't block
    const validItems = order.items.filter(i => i.status !== 'cancelled');
    
    if (validItems.length === 0) {
        // All items cancelled? cancel order or mark completed?
        // If all items are cancelled, order should probably be cancelled.
        const allCancelled = order.items.length > 0 && order.items.every(i => i.status === 'cancelled');
        if (allCancelled && order.status !== 'cancelled') {
             await order.update({ status: 'cancelled' });
        }
        return;
    }

    // Check if all valid items are completed or served
    const allComplete = validItems.every(i => ['completed', 'served'].includes(i.status));

    if (allComplete && !['completed', 'served', 'cancelled'].includes(order.status)) {
       // Mark order as completed
       await order.update({ status: 'completed' });
       
       // If order is part of a batch, check batch completion
       if (order.batchId) {
         await this.checkBatchCompletion(order.batchId);
       }
    }
  }

  /**
   * Check if batch is complete based on its orders
   */
  async checkBatchCompletion(batchId) {
    const batch = await OrderBatch.findByPk(batchId, {
      include: [{ model: RestaurantOrder, as: 'orders' }]
    });

    if (!batch) return;

    const validOrders = batch.orders.filter(o => o.status !== 'cancelled');
    
    if (validOrders.length === 0) return;

    const allComplete = validOrders.every(o => ['completed', 'served', 'paid'].includes(o.status));

    if (allComplete && !['completed', 'cancelled'].includes(batch.status)) {
      await batch.update({ 
        status: 'completed',
        completedAt: new Date()
      });
    }
  }

  /**
   * Delete all restaurant orders and related data
   */
  async deleteAllOrders() {
    // Delete in order to respect dependencies
    await RestaurantOrderItem.destroy({ where: {}, force: true });
    await RestaurantOrder.destroy({ where: {}, force: true });
    await BatchSource.destroy({ where: {}, force: true });
    await OrderBatch.destroy({ where: {}, force: true });
    return true;
  }
}

export default new RestaurantService();
