import db from '../models/index.js';

const {
  Reservation,
  Room,
  Guest,
  Staff,
  MenuItem,
  RestaurantOrder,
  InventoryItem,
  Notification,
  InventoryStock,
  BarOrder,
  RoomType,
} = db;

class DashboardService {
  /**
   * Get comprehensive dashboard statistics
   */
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    try {
      const [
        overview,
        today,
        periods,
        revenue,
        inventory,
        orders,
        notifications,
        recentActivity
      ] = await Promise.all([
        this.getOverviewStats(),
        this.getTodayStats(),
        this.getPeriodStats(),
        this.getRevenueData(),
        this.getInventoryStats(),
        this.getOrderStats(),
        this.getNotificationStats(),
        this.getRecentActivity()
      ]);

      return {
        success: true,
        data: {
          overview,
          today,
          periods,
          revenue,
          inventory,
          orders,
          notifications,
          recentActivity
        },
        meta: {
          generatedAt: new Date().toISOString(),
          timezone: 'UTC',
          currency: 'NGN',
        },
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return {
        success: false,
        message: 'Failed to generate dashboard statistics',
        error: error.message,
      };
    }
  }

  // --- Helper Methods for Modular/Streaming Access ---

  async getOverviewStats() {
    const [
      totalReservations,
      totalRooms,
      availableRooms,
      occupiedRooms,
      totalGuests,
      totalStaff,
      activeStaff,
      reservationsByRoomType
    ] = await Promise.all([
      Reservation.count(),
      Room.count(),
      Room.count({ where: { status: 'available' } }),
      Room.count({ where: { status: 'occupied' } }),
      Guest.count(),
      Staff.count(),
      Staff.count({ where: { status: 'active' } }),
      RoomType.findAll({
        attributes: [
          'name',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('rooms.reservations.id')), 'reservationCount']
        ],
        include: [{
          model: Room,
          as: 'rooms',
          attributes: [],
          include: [{
            model: Reservation,
            as: 'reservations',
            attributes: []
          }]
        }],
        group: ['RoomType.id', 'RoomType.name'],
        order: [[db.Sequelize.literal('"reservationCount"'), 'DESC']]
      })
    ]);

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    
    return {
      totalReservations,
      totalRooms,
      availableRooms,
      occupiedRooms,
      occupancyRate,
      totalGuests,
      totalStaff,
      activeStaff,
      reservationsByRoomType: reservationsByRoomType.map(item => ({
        name: item.name,
        count: parseInt(item.get('reservationCount'), 10)
      }))
    };
  }

  async getTodayStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      reservations,
      checkIns,
      pendingCheckIns,
      barOrders,
      restaurantOrders
    ] = await Promise.all([
      Reservation.count({
        where: { created_at: { [db.Sequelize.Op.gte]: startOfDay } },
      }),
      Reservation.count({
        where: {
          checkInDate: { [db.Sequelize.Op.between]: [startOfDay, new Date()] },
        },
      }),
      Reservation.count({
        where: {
          checkInDate: { [db.Sequelize.Op.lt]: startOfDay },
          status: 'pending',
        },
      }),
      BarOrder.count({
        where: { created_at: { [db.Sequelize.Op.gte]: startOfDay } },
      }),
      RestaurantOrder.count({
        where: { created_at: { [db.Sequelize.Op.gte]: startOfDay } },
      })
    ]);

    return {
      reservations,
      checkIns,
      pendingCheckIns,
      orders: barOrders + restaurantOrders,
      date: new Date().toISOString(),
    };
  }

  async getPeriodStats() {
    const now = new Date();
    const startOfWeek = new Date(new Date().setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [weekly, monthly, yearly] = await Promise.all([
      Reservation.count({ created_at: { [db.Sequelize.Op.gte]: startOfWeek } }),
      Reservation.count({ created_at: { [db.Sequelize.Op.gte]: startOfMonth } }),
      Reservation.count({ created_at: { [db.Sequelize.Op.gte]: startOfYear } })
    ]);

    return { weekly, monthly, yearly };
  }

  async getRevenueData() {
     const now = new Date();
     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

     const monthlyRevenue = await Reservation.sum('totalAmount', {
        where: {
          status: ['confirmed', 'checked_in', 'checked_out'],
          created_at: { [db.Sequelize.Op.gte]: startOfMonth },
        },
      });

      // Occupancy Trend (Last 30 days)
      const occupancyData = await Reservation.findAll({
        where: {
          created_at: {
            [db.Sequelize.Op.gte]: new Date(new Date().setDate(now.getDate() - 30)),
          },
        },
        attributes: [
          [db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'date'],
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count'],
        ],
        group: [db.Sequelize.fn('DATE', db.Sequelize.col('created_at'))],
        order: [[db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'ASC']],
      });

      return {
        monthly: parseFloat(monthlyRevenue || 0),
        currency: 'NGN',
        trend: occupancyData.map(item => ({
          date: item.dataValues.date,
          reservations: parseInt(item.dataValues.count, 10),
          revenue: 0 // Placeholder as mapping revenue per day is complex with grouping
        })),
      };
  }

  async getInventoryStats() {
    const [totalItems, totalMenuItems, lowStockItems] = await Promise.all([
      InventoryItem.count(),
      MenuItem.count(),
      InventoryStock.count({
        include: [{
          model: InventoryItem,
          as: 'item',
          required: true,
          attributes: [],
        }],
        where: db.Sequelize.where(
          db.Sequelize.col('item.reorder_level'),
          '>=',
          db.Sequelize.col('available_quantity')
        ),
        distinct: true,
      })
    ]);

    return { totalItems, lowStockItems, totalMenuItems };
  }

  async getOrderStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalBar, totalRest, todayBar, todayRest] = await Promise.all([
      BarOrder.count(),
      RestaurantOrder.count(),
      BarOrder.count({ where: { created_at: { [db.Sequelize.Op.gte]: startOfDay } } }),
      RestaurantOrder.count({ where: { created_at: { [db.Sequelize.Op.gte]: startOfDay } } })
    ]);

    return {
      total: totalBar + totalRest,
      today: todayBar + todayRest
    };
  }

  async getNotificationStats() {
    const [unread, total] = await Promise.all([
      Notification.count({ where: { read: false } }),
      Notification.count()
    ]);
    return { unread, total };
  }

  async getRecentActivity() {
    const recentReservations = await Reservation.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        { model: Guest, as: 'guest', attributes: ['firstName', 'lastName', 'email'] },
        {
          model: Room,
          as: 'room',
          attributes: ['roomNumber'],
          include: [{ model: RoomType, as: 'roomType', attributes: ['name', 'basePrice'] }],
        },
        { model: Staff, as: 'staff', attributes: ['firstName', 'lastName'] }
      ],
    });

    return {
      reservations: recentReservations.map(reservation => ({
        id: reservation.id,
        guestName: `${reservation.guest?.firstName || ''} ${reservation.guest?.lastName || ''}`.trim(),
        roomNumber: reservation.room?.roomNumber,
        roomType: reservation.room?.roomType?.name || null,
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate,
        status: reservation.status,
        totalAmount: reservation.totalAmount,
        paidAmount: reservation.paidAmount,
        numberOfGuests: reservation.numberOfGuests,
        staffName: `${reservation.staff?.firstName || ''} ${reservation.staff?.lastName || ''}`.trim(),
        createdAt: reservation.created_at,
      }))
    };
  }

  /**
   * Get room occupancy statistics
   */
  async getOccupancyStats(startDate, endDate) {
    try {
      const where = {};
      if (startDate && endDate) {
        where.created_at = {
          [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const occupancyData = await Reservation.findAll({
        where,
        attributes: [
          [db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'date'],
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count'],
        ],
        group: [db.Sequelize.fn('DATE', db.Sequelize.col('created_at'))],
        order: [[db.Sequelize.fn('DATE', db.Sequelize.col('created_at')), 'ASC']],
      });

      return {
        success: true,
        data: occupancyData.map(item => ({
          date: item.dataValues.date,
          reservations: parseInt(item.dataValues.count, 10),
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get occupancy statistics',
        error: error.message,
      };
    }
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(period = 'monthly') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          startDate = new Date(new Date().setDate(now.getDate() - 7));
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const revenue = await Reservation.sum('totalAmount', {
        where: {
          status: ['confirmed', 'checked_in', 'checked_out'],
          created_at: {
            [db.Sequelize.Op.gte]: startDate,
          },
        },
      });

      return {
        success: true,
        data: {
          period,
          revenue: parseFloat(revenue || 0),
          currency: 'NGN',
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get revenue statistics',
        error: error.message,
      };
    }
  }
}

export default new DashboardService();