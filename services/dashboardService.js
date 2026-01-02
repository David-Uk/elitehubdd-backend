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
  async getDashboardStats() {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(new Date().setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Correctly calculate total and today's orders
      const totalOrdersPromise = Promise.all([
        BarOrder.count(),
        RestaurantOrder.count(),
      ]).then(counts => counts.reduce((a, b) => a + b, 0));

      const todayOrdersPromise = Promise.all([
        BarOrder.count({
          where: { created_at: { [db.Sequelize.Op.gte]: startOfDay } },
        }),
        RestaurantOrder.count({
          where: { created_at: { [db.Sequelize.Op.gte]: startOfDay } },
        }),
      ]).then(counts => counts.reduce((a, b) => a + b, 0));

      // Parallel data fetching for better performance
      const [
        totalReservations,
        todayReservations,
        weeklyReservations,
        monthlyReservations,
        yearlyReservations,
        totalRooms,
        availableRooms,
        occupiedRooms,
        totalGuests,
        todayCheckIns,
        pendingCheckIns,
        totalStaff,
        activeStaff,
        totalMenuItems,
        totalOrders,
        todayOrders,
        totalInventoryItems,
        lowStockItems,
        unreadNotifications,
        recentReservations,
        revenueData,
        occupancyData,
        reservationsByRoomType,
      ] = await Promise.all([
        // Reservation stats
        Reservation.count(),
        Reservation.count({
          where: {
            created_at: {
              [db.Sequelize.Op.gte]: startOfDay,
            },
          },
        }),
        Reservation.count({
          where: {
            created_at: {
              [db.Sequelize.Op.gte]: startOfWeek,
            },
          },
        }),
        Reservation.count({
          where: {
            created_at: {
              [db.Sequelize.Op.gte]: startOfMonth,
            },
          },
        }),
        Reservation.count({
          where: {
            created_at: {
              [db.Sequelize.Op.gte]: startOfYear,
            },
          },
        }),

        // Room stats
        Room.count(),
        Room.count({ where: { status: 'available' } }),
        Room.count({ where: { status: 'occupied' } }),

        // Guest stats
        Guest.count(),

        // Check-in stats
        Reservation.count({
          where: {
            checkInDate: {
              [db.Sequelize.Op.between]: [startOfDay, new Date()],
            },
          },
        }),
        Reservation.count({
          where: {
            checkInDate: {
              [db.Sequelize.Op.lt]: startOfDay,
            },
            status: 'pending',
          },
        }),

        // Staff stats
        Staff.count(),
        Staff.count({ where: { status: 'active' } }),

        // Menu items
        MenuItem.count(),

        // Orders
        totalOrdersPromise,
        todayOrdersPromise,

        // Inventory
        InventoryItem.count(),
        InventoryStock.count({
          include: [
            {
              model: InventoryItem,
              as: 'item',
              required: true,
              attributes: [],
            },
          ],
          where: db.Sequelize.where(
            db.Sequelize.col('item.reorder_level'),
            '>=',
            db.Sequelize.col('available_quantity')
          ),
          distinct: true,
        }),

        // Notifications
        Notification.count({
          where: { read: false },
        }),

        // Recent reservations (last 7 days)
        Reservation.findAll({
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [
            { model: Guest, as: 'guest', attributes: ['firstName', 'lastName', 'email'] },
            {
              model: Room,
              as: 'room',
              attributes: ['roomNumber'],
              include: [
                {
                  model: RoomType,
                  as: 'roomType',
                  attributes: ['name', 'basePrice'],
                },
              ],
            },
            {
                model: Staff,
                as: 'staff',
                attributes: ['firstName', 'lastName'],
            }
          ],
        }),

        // Revenue data (confirmed reservations)
        Reservation.findAll({
          where: {
            status: ['confirmed', 'checked_in', 'checked_out'],
            created_at: {
              [db.Sequelize.Op.gte]: startOfMonth,
            },
          },
          include: [
            {
              model: Room,
              as: 'room',
              include: [
                {
                  model: RoomType,
                  as: 'roomType',
                  attributes: ['basePrice'],
                },
              ],
            },
          ],
        }),

        // Occupancy data for last 30 days
        Reservation.findAll({
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
        }),
        
        // Reservations by room type
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

      // Calculate revenue
      const monthlyRevenue = revenueData.reduce((total, reservation) => {
        return total + (reservation.room?.roomType?.basePrice || 0);
      }, 0);

      // Calculate occupancy rate
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      // Format occupancy data
      const occupancyTrend = occupancyData.map(item => ({
        date: item.dataValues.date,
        reservations: parseInt(item.dataValues.count, 10),
      }));

      // Format recent reservations
      const formattedRecentReservations = recentReservations.map(reservation => ({
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
      }));
      
      // Format reservations by room type
      const formattedReservationsByRoomType = reservationsByRoomType.map(item => ({
          name: item.name,
          count: parseInt(item.get('reservationCount'), 10)
      }));

      return {
        success: true,
        data: {
          // Overview Stats
          overview: {
            totalReservations,
            totalRooms,
            availableRooms,
            occupiedRooms,
            occupancyRate,
            totalGuests,
            totalStaff,
            activeStaff,
            reservationsByRoomType: formattedReservationsByRoomType,
          },

          // Today's Stats
          today: {
            reservations: todayReservations,
            checkIns: todayCheckIns,
            pendingCheckIns,
            orders: todayOrders,
            date: new Date().toISOString(),
          },

          // Time Period Stats
          periods: {
            weekly: weeklyReservations,
            monthly: monthlyReservations,
            yearly: yearlyReservations,
          },

          // Revenue Stats
          revenue: {
            monthly: monthlyRevenue,
            currency: 'NGN',
            trend: occupancyTrend,
          },

          // Inventory Stats
          inventory: {
            totalItems: totalInventoryItems,
            lowStockItems,
            totalMenuItems,
          },

          // Orders Stats
          orders: {
            total: totalOrders,
            today: todayOrders,
          },

          // Notifications
          notifications: {
            unread: unreadNotifications,
            total: await Notification.count(),
          },

          // Recent Activity
          recentActivity: {
            reservations: formattedRecentReservations,
          },
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

      const revenueData = await Reservation.findAll({
        where: {
          status: ['confirmed', 'checked_in', 'checked_out'],
          created_at: {
            [db.Sequelize.Op.gte]: startDate,
          },
        },
        include: [
          {
            model: Room,
            as: 'room',
            include: [
              {
                model: RoomType,
                as: 'roomType',
                attributes: ['basePrice'],
              },
            ],
          },
        ],
      });

      const revenue = revenueData.reduce((total, reservation) => {
        return total + (reservation.room?.roomType?.basePrice || 0);
      }, 0);

      return {
        success: true,
        data: {
          period,
          revenue,
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