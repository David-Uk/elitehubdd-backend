import { 
  OrderBatch, 
  RestaurantOrder, 
  RestaurantOrderItem, 
  MenuItem, 
  Staff, 
  Reservation,
  BatchSource 
} from '../models/index.js';
import db from '../config/database.js';

class RestaurantService {
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

    return batch;
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
              where: menuItemId ? { menuItemId } : undefined
            }
          ]
        }
      ]
    });

    if (!batch) {
      throw new Error('Batch not found');
    }

    if (batch.status === 'completed' || batch.status === 'cancelled') {
      throw new Error('Cannot edit completed or cancelled batches');
    }

    let updatedOrders = [];

    switch (action) {
      case 'increase':
        updatedOrders = await this.increaseBatchItem(batch, menuItemId, quantity, reason);
        break;
      case 'reduce':
        updatedOrders = await this.reduceBatchItem(batch, menuItemId, quantity, reason);
        break;
      case 'remove':
        updatedOrders = await this.removeBatchItem(batch, menuItemId, reason);
        break;
      case 'add':
        updatedOrders = await this.addNewBatchItem(batch, menuItemId, quantity, reason);
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
      await this.updateOrderTotals(targetOrder.orderId);
    } else {
      // Create new order with this item
      const newOrder = await RestaurantOrder.create({
        orderNumber: await this.generateOrderNumber(),
        staffId: batch.staffId,
        batchId: batch.id,
        tableNumber: 'Batch Edit',
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

    // Create new order with this menu item
    const newOrder = await RestaurantOrder.create({
      orderNumber: await this.generateOrderNumber(),
      staffId: batch.staffId,
      batchId: batch.id,
      tableNumber: 'Batch Edit - New Item',
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
    await this.updateOrderTotals(targetOrder.orderId);

    return batch.orders;
  }

  /**
   * Remove a menu item completely from batch
   */
  async removeBatchItem(batch, menuItemId, reason) {
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
      where: { orderId: targetOrder.orderId }
    });

    if (remainingItems.length === 0) {
      // Remove entire order if no items left
      await targetOrder.destroy();
    } else {
      // Update order totals
      await this.updateOrderTotals(targetOrder.orderId);
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
        }
      ]
    });

    if (!batch) return;

    const totalItems = batch.orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const totalAmount = batch.orders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount || 0);
    }, 0);

    const tax = totalAmount * 0.05;
    const serviceCharge = totalAmount * 0.10;

    await batch.update({
      totalItems,
      totalAmount,
      tax,
      serviceCharge
    });
  }

  /**
   * Generate order number
   */
  async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `RO${year}${month}${day}${hours}${minutes}${seconds}${random}`;
  }
}

export default new RestaurantService();
