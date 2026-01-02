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
    const { page = 1, limit = 20, type } = query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (type) where.type = type;

    // Visibility filter based on user role
    if (user.role === 'super_admin' || user.role === 'admin') {
      // Admins and super admins see all notifications
      // No filter needed on targetRoles
    } else {
      // Other users see notifications where their role is in targetRoles
      // AND notifications they created themselves
      where[db.Sequelize.Op.or] = [
        {
          targetRoles: {
            [db.Sequelize.Op.contains]: [user.role]
          }
        },
        {
          staffId: user.id // User can see their own actions
        }
      ];
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
   * Log API action - called by middleware
   */
  async logApiAction(req, res, next) {
    // Skip logging for GET requests
    if (req.method === 'GET') {
      return next();
    }

    try {
      const user = req.user;
      if (!user) {
        return next(); // Skip if no authenticated user
      }

      // Extract action details from request
      const action = this.getActionFromRequest(req);
      const message = this.getMessageFromRequest(req, res);
      
      // Determine target roles based on action
      const targetRoles = this.getTargetRolesForAction(action, user.role);

      await this.logAction({
        action,
        message,
        staffId: user.id,
        targetRoles,
        metadata: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query,
          statusCode: res.statusCode
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        type: this.getNotificationType(res.statusCode)
      });
    } catch (error) {
      console.error('Failed to log API action:', error);
      // Don't fail the request
    }

    return next();
  }

  /**
   * Extract action identifier from request
   */
  getActionFromRequest(req) {
    const method = req.method;
    const route = req.route?.path || req.path;
    
    // Map common routes to action identifiers
    const routeMap = {
      '/reservations': 'RESERVATION',
      '/orders': 'ORDER',
      '/batches': 'BATCH',
      '/menu-items': 'MENU_ITEM',
      '/inventory': 'INVENTORY',
      '/staff': 'STAFF',
      '/auth': 'AUTH',
      '/reports': 'REPORT'
    };

    // Find the matching route
    for (const [routePath, prefix] of Object.entries(routeMap)) {
      if (route.includes(routePath)) {
        return `${method}_${prefix}`;
      }
    }

    // Fallback
    return `${method}_API_CALL`;
  }

  /**
   * Generate human readable message from request
   */
  getMessageFromRequest(req, res) {
    const user = req.user;
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    const method = req.method;
    const route = req.route?.path || req.path;
    const success = res.statusCode < 400;

    let action = '';
    if (method === 'POST') action = 'created';
    else if (method === 'PUT' || method === 'PATCH') action = 'updated';
    else if (method === 'DELETE') action = 'deleted';
    else action = 'accessed';

    return `${userName} ${action} ${route} ${success ? 'successfully' : 'with errors'}`;
  }

  /**
   * Determine which roles should see this notification
   */
  getTargetRolesForAction(action, userRole) {
    // Admin and super admin see everything
    const baseRoles = ['super_admin', 'admin'];
    
    // Add the user's role so they can see their own actions
    const userRoles = [userRole];
    
    // Add specific roles based on action type
    const actionRoles = [];
    if (action.includes('RESERVATION')) {
      actionRoles.push('supervisor', 'front_desk');
    } else if (action.includes('ORDER') || action.includes('BATCH')) {
      actionRoles.push('kitchen_staff', 'waiter', 'supervisor');
    } else if (action.includes('MENU_ITEM')) {
      actionRoles.push('kitchen_staff', 'supervisor');
    } else if (action.includes('INVENTORY')) {
      actionRoles.push('supervisor', 'store_keeper');
    } else if (action.includes('STAFF')) {
      actionRoles.push('supervisor', 'hr');
    }

    return [...new Set([...baseRoles, ...userRoles, ...actionRoles])];
  }

  /**
   * Get notification type based on status code
   */
  getNotificationType(statusCode) {
    if (statusCode >= 400) return 'error';
    if (statusCode >= 300) return 'warning';
    if (statusCode >= 200) return 'success';
    return 'info';
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
