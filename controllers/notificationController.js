import notificationService from '../services/notificationService.js';

class NotificationController {
  /**
   * Get notifications for the authenticated user
   */
  async getNotifications(req, res) {
    try {
      const user = req.user;
      const { page = 1, limit = 20, type } = req.query;

      const result = await notificationService.getNotifications(user, { page, limit, type });

      res.status(200).json({
        success: true,
        data: result.notifications,
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
   * Mark notification as read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      await notificationService.markAsRead(id);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(req, res) {
    try {
      const user = req.user;
      const db = await import('../models/index.js');
      const { Notification } = db.default;

      let where = {};

      // Filter based on user role
      if (user.role === 'super_admin' || user.role === 'admin') {
        // Admins see all notifications
      } else {
        // Other users see notifications where their role is in targetRoles
        // AND notifications they created themselves
        where[db.default.Sequelize.Op.or] = [
          {
            targetRoles: {
              [db.default.Sequelize.Op.contains]: [user.role]
            }
          },
          {
            staffId: user.id
          }
        ];
      }

      const stats = await Notification.findAll({
        where,
        attributes: [
          'type',
          [db.default.Sequelize.fn('COUNT', db.default.Sequelize.col('id')), 'count']
        ],
        group: ['type'],
        raw: true
      });

      const totalNotifications = await Notification.count({ where });
      const unreadNotifications = await Notification.count({ 
        where: { 
          ...where, 
          read: false 
        } 
      });

      res.status(200).json({
        success: true,
        data: {
          total: totalNotifications,
          unread: unreadNotifications,
          byType: stats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Clear all notifications (Super Admin only)
   */
  async clearAllNotifications(req, res) {
    try {
      const db = await import('../models/index.js');
      const { Notification } = db.default;

      await Notification.destroy({ where: {} });

      res.status(200).json({
        success: true,
        message: 'All notifications cleared successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new NotificationController();
