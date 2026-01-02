import db from '../models/index.js';

const { Reservation, Guest, Room, RoomType, Staff } = db;

// Helper function to filter staff data based on user role
const filterStaffData = (staff, user) => {
  if (!staff || !user) return staff;
  
  // Always exclude super admins unless the user is a super admin
  if (staff.role === 'super_admin' && user.role !== 'super_admin') {
    return null;
  }
  
  // If user is admin, they can only see themselves and non-admin staff
  if (user.role === 'admin') {
    return staff.id === user.id || !['super_admin', 'admin'].includes(staff.role) ? staff : null;
  }
  
  // For other roles, exclude admins and super admins
  return !['super_admin', 'admin'].includes(staff.role) ? staff : null;
};

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
  async getReservationById(id, user = null) {
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

    // Apply staff filtering if user is provided
    if (user && reservation.staff) {
      const filteredStaff = filterStaffData(reservation.staff, user);
      if (!filteredStaff) {
        // If staff is filtered out, remove the staff association
        reservation.staff = null;
      } else {
        reservation.staff = filteredStaff;
      }
    }

    return reservation;
  }

  /**
   * Get all reservations with filters
   */
  async getAllReservations(filters = {}, pagination = {}, user = null) {
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

    // Apply staff filtering if user is provided
    if (user) {
      rows.forEach(reservation => {
        if (reservation.staff) {
          const filteredStaff = filterStaffData(reservation.staff, user);
          if (!filteredStaff) {
            reservation.staff = null;
          } else {
            reservation.staff = filteredStaff;
          }
        }
      });
    }

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

  /**
   * Get available rooms for guests (public endpoint)
   */
  async getAvailableBookings(filters = {}, pagination = {}) {
    const { startDate, endDate, roomTypeId, roomId } = filters;
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // If no dates provided, return all available rooms grouped by room type
    if (!startDate || !endDate) {
      // Get all rooms that are currently available (not reserved or occupied)
      let roomWhereClause = { 
        status: 'available'
      };
      
      if (roomTypeId) {
        roomWhereClause.roomTypeId = roomTypeId;
      }
      
      if (roomId) {
        // Try to find room by UUID or room number
        let room = await Room.findByPk(roomId);
        if (!room) {
          room = await Room.findOne({ where: { roomNumber: roomId } });
        }
        if (room) {
          roomWhereClause.id = room.id;
        }
      }

      // Find rooms with any active reservations (confirmed or pending)
      const now = new Date();
      const bookedRoomIds = await Reservation.findAll({
        where: {
          status: ['confirmed', 'pending'],
          [db.Sequelize.Op.or]: [
            {
              checkInDate: {
                [db.Sequelize.Op.lte]: now
              },
              checkOutDate: {
                [db.Sequelize.Op.gte]: now
              }
            }
          ]
        },
        attributes: ['roomId']
      }).then(reservations => reservations.map(r => r.roomId));

      // Get all available rooms that are not currently booked
      const availableRooms = await Room.findAll({
        where: {
          ...roomWhereClause,
          id: {
            [db.Sequelize.Op.notIn]: bookedRoomIds
          }
        },
        include: [
          {
            model: RoomType,
            as: 'roomType',
            attributes: ['id', 'name', 'description', 'basePrice', 'capacity', 'amenities']
          }
        ],
        order: [['roomType', 'name'], ['roomNumber', 'ASC']]
      });

      // Group by room type and count available rooms
      const roomTypeGroups = availableRooms.reduce((acc, room) => {
        const typeName = room.roomType.name;
        if (!acc[typeName]) {
          acc[typeName] = {
            roomType: {
              id: room.roomType.id,
              name: room.roomType.name,
              description: room.roomType.description,
              basePrice: room.roomType.basePrice,
              capacity: room.roomType.capacity,
              amenities: room.roomType.amenities
            },
            availableCount: 0
          };
        }
        
        acc[typeName].availableCount++;
        
        return acc;
      }, {});

      // Filter out room types with zero available rooms
      const availableRoomTypes = Object.values(roomTypeGroups).filter(roomType => roomType.availableCount > 0);

      return {
        roomTypes: availableRoomTypes,
        meta: {
          total: availableRoomTypes.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 1
        }
      };
    }

    // If dates are provided, check availability for specific dates
    const conflictingRoomIds = await Reservation.findAll({
      where: {
        status: ['confirmed', 'pending'],
        [db.Sequelize.Op.or]: [
          {
            checkInDate: {
              [db.Sequelize.Op.between]: [startDate, endDate]
            }
          },
          {
            checkOutDate: {
              [db.Sequelize.Op.between]: [startDate, endDate]
            }
          },
          {
            [db.Sequelize.Op.and]: [
              { checkInDate: { [db.Sequelize.Op.lte]: startDate } },
              { checkOutDate: { [db.Sequelize.Op.gte]: endDate } }
            ]
          }
        ]
      },
      attributes: ['roomId']
    }).then(reservations => reservations.map(r => r.roomId));

    // Get available rooms for the specified dates
    let whereClause = {
      status: 'available'
    };

    if (roomTypeId) {
      whereClause.roomTypeId = roomTypeId;
    }

    if (roomId) {
      // Try to find room by UUID or room number
      let room = await Room.findByPk(roomId);
      if (!room) {
        room = await Room.findOne({ where: { roomNumber: roomId } });
      }
      if (room) {
        whereClause.id = room.id;
      }
    }

    const availableRooms = await Room.findAll({
      where: {
        ...whereClause,
        id: {
          [db.Sequelize.Op.notIn]: conflictingRoomIds
        }
      },
      include: [
        {
          model: RoomType,
          as: 'roomType',
          attributes: ['id', 'name', 'description', 'basePrice', 'capacity', 'amenities']
        }
      ],
      order: [['roomType', 'name'], ['roomNumber', 'ASC']]
    });

    // Group by room type and count available rooms
    const roomTypeGroups = availableRooms.reduce((acc, room) => {
      const typeName = room.roomType.name;
      if (!acc[typeName]) {
        acc[typeName] = {
          roomType: {
            id: room.roomType.id,
            name: room.roomType.name,
            description: room.roomType.description,
            basePrice: room.roomType.basePrice,
            capacity: room.roomType.capacity,
            amenities: room.roomType.amenities
          },
          availableCount: 0
        };
      }
      
      acc[typeName].availableCount++;
      
      return acc;
    }, {});

    // Filter out room types with zero available rooms
    const availableRoomTypes = Object.values(roomTypeGroups).filter(roomType => roomType.availableCount > 0);

    return {
      roomTypes: availableRoomTypes,
      searchDates: {
        startDate,
        endDate
      },
      meta: {
        total: availableRoomTypes.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 1
      }
    };
  }

  /**
   * Create guest reservation (public endpoint)
   */
  async createGuestReservation(reservationData) {
    const {
      roomTypeId, // Changed from roomId to roomTypeId
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
      guestEmail,
      guestPhone,
      guestFirstName,
      guestLastName
    } = reservationData;

    // Always create a new guest record
    const guest = await Guest.create({
      firstName: guestFirstName,
      lastName: guestLastName,
      email: guestEmail,
      phone: guestPhone || '0000000000', // Default phone if not provided
      address: null,
      city: null,
      country: null,
      idType: 'national_id', // Default ID type
      idNumber: 'GUEST-' + Date.now(), // Generate unique ID number
      dateOfBirth: null,
      nationality: null,
      preferences: {},
      notes: null,
      status: 'active'
    });

    if (!guest) {
      throw new Error('Failed to create guest record');
    }

    // Check if room type exists
    const roomType = await RoomType.findByPk(roomTypeId);
    if (!roomType) {
      throw new Error('Room type not found');
    }

    // Check room capacity
    if (numberOfGuests > roomType.capacity) {
      throw new Error(`Room type capacity is ${roomType.capacity} guests, but ${numberOfGuests} guests requested`);
    }

    // Find conflicting reservations for the date range
    const conflictingRoomIds = await Reservation.findAll({
      where: {
        status: ['confirmed', 'pending'],
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
      },
      attributes: ['roomId']
    }).then(reservations => reservations.map(r => r.roomId));

    // Find an available room of the specified type
    const availableRoom = await Room.findOne({
      where: {
        roomTypeId: roomTypeId,
        status: 'available',
        id: {
          [db.Sequelize.Op.notIn]: conflictingRoomIds
        }
      },
      include: [
        {
          model: RoomType,
          as: 'roomType'
        }
      ],
      order: [['roomNumber', 'ASC']] // Get the first available room
    });

    if (!availableRoom) {
      throw new Error('No available rooms found for the selected room type and dates');
    }

    // Calculate total cost
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalCost = nights * roomType.basePrice;

    // Generate reservation number
    const reservationNumber = 'RES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Update room status to reserved
    await availableRoom.update({
      status: 'reserved'
    });

    // Create reservation without staffId (guest reservation)
    const reservation = await Reservation.create({
      reservationNumber: reservationNumber,
      guestId: guest.id,
      roomId: availableRoom.id, // Assign the specific room
      staffId: null, // No staff for guest reservations
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests: specialRequests || null,
      status: 'pending', // Guest reservations start as pending
      totalAmount: totalCost, // Use totalAmount field instead of totalCost
      paidAmount: 0, // No payment yet for guest reservations
      notes: null
    });

    // Return the reservation with related data
    const result = await Reservation.findByPk(reservation.id, {
      include: [
        {
          model: Guest,
          as: 'guest'
        },
        {
          model: Room,
          as: 'room',
          include: [{ model: RoomType, as: 'roomType' }]
        }
      ]
    });

    // Add calculated cost details to the response
    const responseData = result.toJSON();
    responseData.costBreakdown = {
      basePrice: roomType.basePrice,
      nights: nights,
      totalCost: totalCost,
      currency: 'NGN' // Nigerian Naira
    };

    // Add printable confirmation details
    responseData.printableConfirmation = {
      reservationNumber: reservationNumber,
      guestName: `${guest.firstName} ${guest.lastName}`,
      guestEmail: guest.email,
      guestPhone: guest.phone,
      roomNumber: availableRoom.roomNumber,
      roomType: roomType.name,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      numberOfGuests: numberOfGuests,
      totalAmount: totalCost,
      currency: 'NGN',
      status: 'pending',
      specialRequests: specialRequests || null,
      bookingDate: new Date().toISOString(),
      confirmationMessage: 'Your reservation request has been submitted successfully. You will receive a confirmation email once your reservation is approved by our staff.',
      importantNotes: [
        'This reservation is currently PENDING and requires staff approval.',
        'You will receive an email confirmation when your reservation is approved.',
        'Check-in time is 2:00 PM and check-out time is 11:00 AM.',
        'Please bring a valid ID for verification upon arrival.',
        'For any changes or inquiries, please contact our reception desk.'
      ],
      hotelInfo: {
        name: 'EliteHub Hotel',
        address: '123 Luxury Avenue, Lagos, Nigeria',
        phone: '+234-800-000-0000',
        email: 'reservations@elitehubhotel.com'
      }
    };

    return responseData;
  }
}

export default new ReservationService();
