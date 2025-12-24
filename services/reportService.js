import db from '../models/index.js';

const { Reservation, RestaurantOrder, BarOrder, Feedback, Room, RoomType, Guest } = db;

class ReportService {
  /**
   * Get revenue report
   */
  async getRevenueReport(startDate, endDate) {
    // Room revenue
    const roomRevenue = await Reservation.sum('totalAmount', {
      where: {
        status: 'checked_out',
        actualCheckOut: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      }
    });

    // Restaurant revenue
    const restaurantRevenue = await RestaurantOrder.sum('totalAmount', {
      where: {
        paymentStatus: 'paid',
        createdAt: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      }
    });

    // Bar revenue
    const barRevenue = await BarOrder.sum('totalAmount', {
      where: {
        paymentStatus: 'paid',
        createdAt: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      }
    });

    const totalRevenue = (roomRevenue || 0) + (restaurantRevenue || 0) + (barRevenue || 0);

    return {
      period: { startDate, endDate },
      roomRevenue: roomRevenue || 0,
      restaurantRevenue: restaurantRevenue || 0,
      barRevenue: barRevenue || 0,
      totalRevenue
    };
  }

  /**
   * Get occupancy report
   */
  async getOccupancyReport(startDate, endDate) {
    const totalRooms = await Room.count();

    const occupiedRooms = await Reservation.count({
      where: {
        status: 'checked_in',
        checkInDate: {
          [db.Sequelize.Op.lte]: endDate
        },
        checkOutDate: {
          [db.Sequelize.Op.gte]: startDate
        }
      }
    });

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    const roomsByStatus = await Room.findAll({
      attributes: [
        'status',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    return {
      period: { startDate, endDate },
      totalRooms,
      occupiedRooms,
      occupancyRate: occupancyRate.toFixed(2),
      roomsByStatus
    };
  }

  /**
   * Get reservation statistics
   */
  async getReservationStats(startDate, endDate) {
    const totalReservations = await Reservation.count({
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      }
    });

    const reservationsByStatus = await Reservation.findAll({
      attributes: [
        'status',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      group: ['status']
    });

    const averageStay = await Reservation.findAll({
      attributes: [
        [db.Sequelize.fn('AVG', 
          db.Sequelize.literal('DATEDIFF(check_out_date, check_in_date)')
        ), 'avgStay']
      ],
      where: {
        status: 'checked_out',
        actualCheckOut: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      raw: true
    });

    return {
      period: { startDate, endDate },
      totalReservations,
      reservationsByStatus,
      averageStay: averageStay[0]?.avgStay || 0
    };
  }

  /**
   * Get feedback summary
   */
  async getFeedbackSummary(startDate, endDate) {
    const where = {
      createdAt: {
        [db.Sequelize.Op.between]: [startDate, endDate]
      }
    };

    const totalFeedbacks = await Feedback.count({ where });

    const averageRatings = await Feedback.findAll({
      attributes: [
        [db.Sequelize.fn('AVG', db.Sequelize.col('overall_rating')), 'avgOverall'],
        [db.Sequelize.fn('AVG', db.Sequelize.col('cleanliness_rating')), 'avgCleanliness'],
        [db.Sequelize.fn('AVG', db.Sequelize.col('service_rating')), 'avgService'],
        [db.Sequelize.fn('AVG', db.Sequelize.col('facilities_rating')), 'avgFacilities'],
        [db.Sequelize.fn('AVG', db.Sequelize.col('value_rating')), 'avgValue'],
        [db.Sequelize.fn('AVG', db.Sequelize.col('location_rating')), 'avgLocation']
      ],
      where,
      raw: true
    });

    const recommendationRate = await Feedback.count({
      where: {
        ...where,
        wouldRecommend: true
      }
    });

    return {
      period: { startDate, endDate },
      totalFeedbacks,
      averageRatings: averageRatings[0],
      recommendationRate: totalFeedbacks > 0 
        ? ((recommendationRate / totalFeedbacks) * 100).toFixed(2) 
        : 0
    };
  }

  /**
   * Get top performing rooms
   */
  async getTopPerformingRooms(startDate, endDate, limit = 10) {
    const topRooms = await Reservation.findAll({
      attributes: [
        'roomId',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('Reservation.id')), 'bookingCount'],
        [db.Sequelize.fn('SUM', db.Sequelize.col('total_amount')), 'totalRevenue']
      ],
      where: {
        status: 'checked_out',
        actualCheckOut: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Room,
          as: 'room',
          include: [{ model: RoomType, as: 'roomType' }]
        }
      ],
      group: ['roomId'],
      order: [[db.Sequelize.literal('totalRevenue'), 'DESC']],
      limit
    });

    return topRooms;
  }

  /**
   * Get guest statistics
   */
  async getGuestStats(startDate, endDate) {
    const newGuests = await Guest.count({
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      }
    });

    const returningGuests = await db.sequelize.query(`
      SELECT COUNT(DISTINCT guest_id) as count
      FROM reservations
      WHERE guest_id IN (
        SELECT guest_id
        FROM reservations
        GROUP BY guest_id
        HAVING COUNT(*) > 1
      )
      AND created_at BETWEEN :startDate AND :endDate
    `, {
      replacements: { startDate, endDate },
      type: db.Sequelize.QueryTypes.SELECT
    });

    return {
      period: { startDate, endDate },
      newGuests,
      returningGuests: returningGuests[0]?.count || 0
    };
  }
}

export default new ReportService();
