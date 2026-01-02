import reservationService from '../services/reservationService.js';

class ReservationController {
  /**
   * Create new reservation
   */
  async createReservation(req, res) {
    try {
      const reservationData = {
        ...req.body,
        staffId: req.user.id
      };
      const reservation = await reservationService.createReservation(reservationData);
      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all reservations
   */
  async getAllReservations(req, res) {
    try {
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        guestId: req.query.guestId,
        roomId: req.query.roomId
      };
      
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await reservationService.getAllReservations(filters, pagination, req.user);
      
      res.status(200).json({
        success: true,
        data: result.reservations,
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
   * Get reservation by ID
   */
  async getReservationById(req, res) {
    try {
      const reservation = await reservationService.getReservationById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: reservation
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Check-in guest
   */
  async checkIn(req, res) {
    try {
      const reservation = await reservationService.checkIn(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Guest checked in successfully',
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Check-out guest
   */
  async checkOut(req, res) {
    try {
      const reservation = await reservationService.checkOut(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Guest checked out successfully',
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(req, res) {
    try {
      const reservation = await reservationService.cancelReservation(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Reservation cancelled successfully',
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Check room availability
   */
  async checkRoomAvailability(req, res) {
    try {
      const { checkInDate, checkOutDate } = req.query;

      if (!checkInDate || !checkOutDate) {
        return res.status(400).json({
          success: false,
          message: 'checkInDate and checkOutDate are required'
        });
      }

      const availableRooms = await reservationService.checkRoomAvailability(
        checkInDate,
        checkOutDate
      );

      res.status(200).json({
        success: true,
        message: 'Available rooms retrieved successfully',
        data: {
          checkInDate,
          checkOutDate,
          availableRooms,
          totalAvailable: availableRooms.length
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get available rooms for guests (public endpoint)
   */
  async getAvailableBookings(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        roomId: req.query.roomId,
        roomTypeId: req.query.roomTypeId
      };
      
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };

      const result = await reservationService.getAvailableBookings(filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.roomTypes,
        searchDates: result.searchDates,
        meta: result.meta
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create guest reservation (public endpoint)
   */
  async createGuestReservation(req, res) {
    try {
      const reservationData = {
        ...req.body,
        // No staffId for guest reservations - will be set to null or system user
        status: 'pending', // Guest reservations start as pending
        source: 'guest' // Mark as guest-created
      };
      
      const reservation = await reservationService.createGuestReservation(reservationData);
      
      res.status(201).json({
        success: true,
        message: 'Reservation request submitted successfully. You will receive a confirmation email once approved.',
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new ReservationController();
