import db from '../models/index.js';

const { Room, RoomType } = db;

class RoomController {
  /**
   * Create a new room (admin only)
   */
  async createRoom(req, res) {
    try {
      const { roomNumber, roomTypeId } = req.body;

      // Check if room number already exists
      const existingRoom = await Room.findOne({
        where: { roomNumber }
      });

      if (existingRoom) {
        return res.status(409).json({
          success: false,
          message: 'Room with this number already exists'
        });
      }

      // Verify room type exists
      const roomType = await RoomType.findByPk(roomTypeId);
      if (!roomType) {
        return res.status(400).json({
          success: false,
          message: 'Invalid room type'
        });
      }

      // Create new room with minimal fields
      const newRoom = await Room.create({
        roomNumber,
        roomTypeId,
        status: 'available' // Default status
      });

      // Fetch the complete room with room type details
      const completeRoom = await Room.findByPk(newRoom.id, {
        include: [
          {
            model: RoomType,
            as: 'roomType',
            attributes: ['id', 'name', 'description', 'basePrice', 'amenities', 'capacity', 'bedType', 'numberOfBeds', 'size']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: completeRoom
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all rooms
   */
  async getAllRooms(req, res) {
    try {
      const filters = {
        status: req.query.status,
        type: req.query.type,
        minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity) : undefined,
        maxCapacity: req.query.maxCapacity ? parseInt(req.query.maxCapacity) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const whereClause = {};

      // Apply filters
      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.type) {
        whereClause['$roomType.name$'] = filters.type;
      }

      if (filters.minCapacity !== undefined || filters.maxCapacity !== undefined) {
        whereClause.capacity = {};
        if (filters.minCapacity !== undefined) {
          whereClause.capacity[db.Sequelize.Op.gte] = filters.minCapacity;
        }
        if (filters.maxCapacity !== undefined) {
          whereClause.capacity[db.Sequelize.Op.lte] = filters.maxCapacity;
        }
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        whereClause.price = {};
        if (filters.minPrice !== undefined) {
          whereClause.price[db.Sequelize.Op.gte] = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          whereClause.price[db.Sequelize.Op.lte] = filters.maxPrice;
        }
      }

      const { count, rows: rooms } = await Room.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: RoomType,
            as: 'roomType',
            attributes: ['id', 'name', 'description', 'basePrice', 'amenities']
          }
        ],
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        order: [
          ['roomNumber', 'ASC']
        ]
      });

      res.status(200).json({
        success: true,
        data: rooms,
        meta: {
          total: count,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(count / pagination.limit),
          hasNext: pagination.page < Math.ceil(count / pagination.limit),
          hasPrev: pagination.page > 1
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
   * Get room by ID
   */
  async getRoomById(req, res) {
    try {
      const room = await Room.findByPk(req.params.id, {
        include: [
          {
            model: RoomType,
            as: 'roomType',
            attributes: ['id', 'name', 'description', 'basePrice', 'amenities']
          }
        ]
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get room by room number
   */
  async getRoomByNumber(req, res) {
    try {
      const room = await Room.findOne({
        where: { roomNumber: req.params.roomNumber },
        include: [
          {
            model: RoomType,
            as: 'roomType',
            attributes: ['id', 'name', 'description', 'basePrice', 'amenities']
          }
        ]
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get available rooms for date range
   */
  async getAvailableRooms(req, res) {
    try {
      const { checkInDate, checkOutDate } = req.query;

      if (!checkInDate || !checkOutDate) {
        return res.status(400).json({
          success: false,
          message: 'checkInDate and checkOutDate are required'
        });
      }

      const availableRooms = await Room.findAll({
        where: { status: 'available' },
        include: [
          {
            model: RoomType,
            as: 'roomType',
            attributes: ['id', 'name', 'description', 'basePrice', 'amenities']
          }
        ],
        order: [
          ['roomNumber', 'ASC']
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Available rooms retrieved successfully',
        data: {
          checkInDate,
          checkOutDate,
          rooms: availableRooms,
          totalAvailable: availableRooms.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new RoomController();
