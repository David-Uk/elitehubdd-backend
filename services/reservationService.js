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
      specialRequests
    } = reservationData;

    // Check if room exists - try by UUID first, then by room number
    let room = await Room.findByPk(roomId, {
      include: [{ model: RoomType, as: 'roomType' }]
    });

    // If not found by UUID, try by room number
    if (!room) {
      room = await Room.findOne({
        where: { roomNumber: roomId },
        include: [{ model: RoomType, as: 'roomType' }]
      });
    }

    if (!room) {
      throw new Error('Room not found');
    }

    // Check if room is currently available
    if (room.status !== 'available') {
      throw new Error(`Room is not available. Current status: ${room.status}`);
    }

    // Check if room capacity can accommodate the number of guests
    if (numberOfGuests > room.roomType.capacity) {
      throw new Error(`Room capacity is ${room.roomType.capacity} guests, but ${numberOfGuests} guests requested`);
    }

    // Check for date conflicts with existing reservations
    const conflictingReservation = await Reservation.findOne({
      where: {
        roomId: room.id,
        status: ['confirmed', 'reserved', 'checked_in'],
        [db.Sequelize.Op.or]: [
          {
            checkInDate: {
              [db.Sequelize.Op.between]: [checkInDate, checkOutDate]
            }
          },
          {
            checkOutDate: {
              [db.Sequelize.Op.between]: [checkInDate, checkOutDate]
            }
          },
          {
            [db.Sequelize.Op.and]: [
              { checkInDate: { [db.Sequelize.Op.lte]: checkInDate } },
              { checkOutDate: { [db.Sequelize.Op.gte]: checkOutDate } }
            ]
          }
        ]
      }
    });

    if (conflictingReservation) {
      throw new Error('Room is already booked for the selected dates');
    }

    // Calculate total amount based on room type and number of days
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (numberOfDays <= 0) {
      throw new Error('Check-out date must be after check-in date');
    }

    const totalAmount = room.roomType.basePrice * numberOfDays;

    // Generate reservation number
    const reservationNumber = await this.generateReservationNumber();

    // Create reservation
    const reservation = await Reservation.create({
      reservationNumber,
      guestId,
      roomId: room.id, // Use UUID from fetched room
      staffId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalAmount,
      specialRequests,
      status: 'reserved'
    });

    // Update room status to reserved
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

    if (!['reserved', 'confirmed'].includes(reservation.status)) {
      throw new Error('Reservation must be reserved or confirmed before check-in');
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

    const previousStatus = reservation.status;
    await reservation.update({ status: 'cancelled' });

    // Update room status if it was reserved or confirmed
    if (['confirmed', 'reserved'].includes(previousStatus)) {
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

  /**
   * Check room availability for given dates
   * Returns all rooms that don't have conflicting reservations
   */
  async checkRoomAvailability(checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Validate dates
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error('Invalid date format. Use ISO 8601 format (YYYY-MM-DD or ISO string)');
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Find all rooms
    const allRooms = await Room.findAll({
      include: [
        { model: RoomType, as: 'roomType' }
      ],
      order: [['roomNumber', 'ASC']]
    });

    // Find conflicting reservations
    const conflictingReservations = await Reservation.findAll({
      where: {
        status: ['confirmed', 'reserved', 'checked_in'],
        [db.Sequelize.Op.or]: [
          {
            // Existing reservation overlaps with requested dates
            checkInDate: { [db.Sequelize.Op.lt]: checkOut },
            checkOutDate: { [db.Sequelize.Op.gt]: checkIn }
          }
        ]
      },
      attributes: ['roomId'],
      raw: true
    });

    // Get IDs of rooms with conflicts
    const conflictingRoomIds = conflictingReservations.map(r => r.roomId);

    // Filter available rooms
    const availableRooms = allRooms.filter(room => {
      // Room must be in available status (not maintenance, cleaning, etc.)
      const isStatusAvailable = room.status === 'available' || room.status === 'reserved';
      
      // Room must not have conflicting reservations
      const hasNoConflict = !conflictingRoomIds.includes(room.id);

      return isStatusAvailable && hasNoConflict;
    });

    // Format response data
    return availableRooms.map(room => ({
      id: room.id,
      roomNumber: room.roomNumber,
      status: room.status,
      features: room.features,
      roomType: {
        id: room.roomType.id,
        name: room.roomType.name,
        description: room.roomType.description,
        basePrice: room.roomType.basePrice,
        capacity: room.roomType.capacity,
        amenities: room.roomType.amenities
      },
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    }));
  }
}

export default new ReservationService();
