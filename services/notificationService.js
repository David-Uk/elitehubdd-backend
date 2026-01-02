import db from '../models/index.js';

const { Notification } = db;

class NotificationService {
  /**
   * Log an action to the notification system
   * @param {Object} options
   * @param {string} options.action - Action identifier (e.g., 'INVENTORY_CREATE_ITEM')
   * @param {string} options.message - Human readable message
   * @param {string} [options.userId] - ID of the user performing the action
   * @param {string} [options.staffId] - ID of the staff performing the action
   * @param {Array<string>} [options.targetRoles] - Roles that can view this notification
   * @param {Object} [options.metadata] - Additional data
   * @param {string} [options.ipAddress] - IP Address
   * @param {string} [options.userAgent] - User Agent
   * @param {string} [options.type] - 'info', 'success', 'warning', 'error'
   */
  async logAction({
    action,
    message,
    userId = null,
    staffId = null,
    targetRoles = ['super_admin', 'admin'],
    metadata = null,
    ipAddress = null,
    userAgent = null,
    type = 'info'
  }) {
    // Ensure minimal target roles always include super_admin and admin
    const baseRoles = ['super_admin', 'admin'];
    const finalRoles = [...new Set([...baseRoles, ...(targetRoles || [])])];

    try {
      const notification = await Notification.create({
        action,
        message,
        userId,
        staffId,
        targetRoles: finalRoles,
        metadata,
        ipAddress,
        userAgent,
        type
      });

      // Emit real-time notification
      try {
        const { getIO } = await import('../config/socket.js');
        const io = getIO();
        
        // Broadcast to each target role
        finalRoles.forEach(role => {
          io.to(`role:${role}`).emit('notification', notification);
        });
        
        // Also emit to specific user if needed (not implemented yet but useful future proofing)
      } catch (socketError) {
        // Socket error shouldn't fail the request
        console.warn('Socket.io error or not initialized:', socketError.message);
      }

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Fail silently to not disrupt the main flow
      return null;
    }
  }

  /**
   * Get notifications for a user based on their role
   */
  async getNotifications(user, query = {}) {
    // Logic to fetch notifications where user.role is in targetRoles
    // Postgres JSONB containment: target_roles @> '["role"]' or similar
    // Since target_roles is JSONB array:
    
    // Simplest: use Op.contains if using Postgres JSONB
    // If user is super_admin or admin, return everything?
    // User request: "All notifications... are visible to ... staff of similar roles".
    // super_admin/admin should see ALL? Implicitly yes via targetRoles inclusion, 
    // or explicitly bypassing check.
    
    const { page = 1, limit = 20, type } = query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (type) where.type = type;

    // Visibility filter
    if (user.role === 'super_admin' || user.role === 'admin') {
      // Admins see all? Or only those targeted to admins?
      // Prompt: "All notifications... visible to super admin, admin".
      // So no filter on targetRoles needed for them?
      // "All notifications for all actions are visible to the super admin".
      // Yes. So remove targetRoles check for them.
    } else {
      // For others
      where.targetRoles = {
        [db.Sequelize.Op.contains]: [user.role]
      };
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'username'] },
        { model: db.Staff, as: 'staff', attributes: ['id', 'firstName', 'lastName', 'role'] }
      ]
    });

    return {
      notifications: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Mark as read
   */
  async markAsRead(id) {
    // In a shared notification model (one row for everyone), 'read' boolean is shared.
    // This is a limitation of the current model (single 'read' column).
    // If 'super_admin' reads it, is it read for everyone?
    // Ideally, we need a 'NotificationRead' table.
    // But for now, I'll just toggle the flag on the record.
    // The prompt didn't specify multi-user read state.
    // "Ensure ... logged with the notifications model".
    await Notification.update({ read: true }, { where: { id } });
  }
}

export default new NotificationService();
