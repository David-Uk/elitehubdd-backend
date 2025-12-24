import db from '../models/index.js';

const { Reservation, Guest, Room, RoomType, Staff } = db;

class ReservationService {
  /**
   * Create a new reservation
   */
  async createReservation(reservationData) {
    const {
      guestId,
      roomId,
      staffId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalAmount,
      specialRequests
    } = reservationData;

    // Check if room is available
    const room = await Room.findByPk(roomId, {
      include: [{ model: RoomType, as: 'roomType' }]
    });

    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== 'available') {
      throw new Error('Room is not available');
    }

    // Generate reservation number
    const reservationNumber = await this.generateReservationNumber();

    // Create reservation
    const reservation = await Reservation.create({
      reservationNumber,
      guestId,
      roomId,
      staffId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalAmount,
      specialRequests,
      status: 'confirmed'
    });

    // Update room status
    await room.update({ status: 'reserved' });

    return await this.getReservationById(reservation.id);
  }

  /**
   * Get reservation by ID
   */
  async getReservationById(id) {
    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: Guest, as: 'guest' },
        { model: Room, as: 'room', include: [{ model: RoomType, as: 'roomType' }] },
        { model: Staff, as: 'staff' }
      ]
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    return reservation;
  }

  /**
   * Get all reservations with filters
   */
  async getAllReservations(filters = {}, pagination = {}) {
    const { status, startDate, endDate, guestId, roomId } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};

    if (status) where.status = status;
    if (guestId) where.guestId = guestId;
    if (roomId) where.roomId = roomId;
    
    if (startDate && endDate) {
      where.checkInDate = {
        [db.Sequelize.Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await Reservation.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Guest, as: 'guest' },
        { model: Room, as: 'room', include: [{ model: RoomType, as: 'roomType' }] },
        { model: Staff, as: 'staff' }
      ],
      order: [['checkInDate', 'DESC']],
      distinct: true
    });

    return {
      reservations: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Check-in guest
   */
  async checkIn(reservationId) {
    const reservation = await Reservation.findByPk(reservationId);

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status !== 'confirmed') {
      throw new Error('Reservation must be confirmed before check-in');
    }

    await reservation.update({
      status: 'checked_in',
      actualCheckIn: new Date()
    });

    // Update room status
    await Room.update(
      { status: 'occupied' },
      { where: { id: reservation.roomId } }
    );

    return await this.getReservationById(reservationId);
  }

  /**
   * Check-out guest
   */
  async checkOut(reservationId) {
    const reservation = await Reservation.findByPk(reservationId);

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status !== 'checked_in') {
      throw new Error('Guest must be checked in before check-out');
    }

    await reservation.update({
      status: 'checked_out',
      actualCheckOut: new Date()
    });

    // Update room status
    await Room.update(
      { status: 'cleaning' },
      { where: { id: reservation.roomId } }
    );

    return await this.getReservationById(reservationId);
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(reservationId) {
    const reservation = await Reservation.findByPk(reservationId);

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status === 'checked_out') {
      throw new Error('Cannot cancel a completed reservation');
    }

    await reservation.update({ status: 'cancelled' });

    // Update room status if reserved
    if (reservation.status === 'confirmed') {
      await Room.update(
        { status: 'available' },
        { where: { id: reservation.roomId } }
      );
    }

    return await this.getReservationById(reservationId);
  }

  /**
   * Generate unique reservation number
   */
  async generateReservationNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `RES${year}${month}${day}${random}`;
  }
}

export default new ReservationService();
