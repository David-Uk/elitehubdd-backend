import db from '../models/index.js';

const { Guest, Reservation } = db;
const { Op } = db.Sequelize;

class GuestService {
  /**
   * Create a new guest
   */
  async createGuest(guestData) {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      country,
      idType,
      idNumber,
      dateOfBirth,
      nationality,
      preferences,
      notes
    } = guestData;

    // Check if guest with email already exists
    const existingGuest = await Guest.findOne({
      where: { email }
    });

    if (existingGuest) {
      throw new Error('Guest with this email already exists');
    }

    // Check if guest with ID number already exists
    const existingIdGuest = await Guest.findOne({
      where: { idNumber }
    });

    if (existingIdGuest) {
      throw new Error('Guest with this ID number already exists');
    }

    // Create guest
    const guest = await Guest.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      country,
      idType,
      idNumber,
      dateOfBirth,
      nationality,
      preferences: preferences || {},
      notes
    });

    return guest;
  }

  /**
   * Get guest by ID
   */
  async getGuestById(id) {
    const guest = await Guest.findByPk(id, {
      include: [
        {
          model: Reservation,
          as: 'reservations',
          include: [
            { association: 'room' },
            { association: 'staff' }
          ]
        }
      ]
    });

    if (!guest) {
      throw new Error('Guest not found');
    }

    // Add reservation count
    const guestData = guest.toJSON();
    guestData.reservationCount = guestData.reservations ? guestData.reservations.length : 0;

    return guestData;
  }

  /**
   * Get all guests with filters
   */
  async getAllGuests(filters = {}, pagination = {}) {
    const { search, nationality, idType } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};

    if (nationality) where.nationality = nationality;
    if (idType) where.idType = idType;

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Guest.findAndCountAll({
      where,
      include: [
        {
          model: Reservation,
          as: 'reservations',
          attributes: ['id'], // Only need the ID for counting
          required: false // LEFT JOIN to include guests with no reservations
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    // Add reservation count to each guest
    const guestsWithReservationCount = rows.map(guest => {
      const guestData = guest.toJSON();
      guestData.reservationCount = guestData.reservations ? guestData.reservations.length : 0;
      delete guestData.reservations; // Remove the reservations array to keep response clean
      return guestData;
    });

    return {
      guests: guestsWithReservationCount,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Update guest
   */
  async updateGuest(id, updateData) {
    const guest = await Guest.findByPk(id);

    if (!guest) {
      throw new Error('Guest not found');
    }

    // If email is being updated, check for duplicates
    if (updateData.email && updateData.email !== guest.email) {
      const existingGuest = await Guest.findOne({
        where: { email: updateData.email }
      });

      if (existingGuest) {
        throw new Error('Guest with this email already exists');
      }
    }

    // If ID number is being updated, check for duplicates
    if (updateData.idNumber && updateData.idNumber !== guest.idNumber) {
      const existingIdGuest = await Guest.findOne({
        where: { idNumber: updateData.idNumber }
      });

      if (existingIdGuest) {
        throw new Error('Guest with this ID number already exists');
      }
    }

    await guest.update(updateData);

    return await this.getGuestById(id);
  }

  /**
   * Delete guest (soft delete)
   */
  async deleteGuest(id) {
    const guest = await Guest.findByPk(id);

    if (!guest) {
      throw new Error('Guest not found');
    }

    // Check if guest has active reservations
    const activeReservations = await Reservation.count({
      where: {
        guestId: id,
        status: ['confirmed', 'checked_in']
      }
    });

    if (activeReservations > 0) {
      throw new Error('Cannot delete guest with active reservations');
    }

    await guest.destroy(); // Soft delete due to paranoid: true

    return true;
  }

  /**
   * Search guests
   */
  async searchGuests(query) {
    const guests = await Guest.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${query}%` } },
          { lastName: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
          { idNumber: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit: 20,
      order: [['createdAt', 'DESC']]
    });

    return guests;
  }

  /**
   * Get guest statistics
   */
  async getGuestStats() {
    const totalGuests = await Guest.count();
    
    const guestsByNationality = await Guest.findAll({
      attributes: [
        'nationality',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['nationality'],
      order: [[db.Sequelize.literal('count'), 'DESC']]
    });

    const guestsByIdType = await Guest.findAll({
      attributes: [
        'idType',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['idType']
    });

    const recentGuests = await Guest.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    return {
      totalGuests,
      guestsByNationality,
      guestsByIdType,
      recentGuests
    };
  }
}

export default new GuestService();
