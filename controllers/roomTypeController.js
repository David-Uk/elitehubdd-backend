import db from '../models/index.js';

const { RoomType } = db;

class RoomTypeController {
  /**
   * Get all room types
   */
  async getAllRoomTypes(req, res) {
    try {
      const filters = {
        name: req.query.name,
        minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity) : undefined,
        maxCapacity: req.query.maxCapacity ? parseInt(req.query.maxCapacity) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        bedType: req.query.bedType
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const whereClause = {};

      // Apply filters
      if (filters.name) {
        whereClause.name = {
          [db.Sequelize.Op.iLike]: `%${filters.name}%`
        };
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
        whereClause.basePrice = {};
        if (filters.minPrice !== undefined) {
          whereClause.basePrice[db.Sequelize.Op.gte] = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          whereClause.basePrice[db.Sequelize.Op.lte] = filters.maxPrice;
        }
      }

      if (filters.bedType) {
        whereClause.bedType = filters.bedType;
      }

      const { count, rows: roomTypes } = await RoomType.findAndCountAll({
        where: whereClause,
        limit: pagination.limit,
        offset: (pagination.page - 1) * pagination.limit,
        order: [
          ['basePrice', 'ASC'],
          ['name', 'ASC']
        ]
      });

      res.status(200).json({
        success: true,
        data: roomTypes,
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
   * Get room type by ID
   */
  async getRoomTypeById(req, res) {
    try {
      const roomType = await RoomType.findByPk(req.params.id);

      if (!roomType) {
        return res.status(404).json({
          success: false,
          message: 'Room type not found'
        });
      }

      res.status(200).json({
        success: true,
        data: roomType
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get room type by name
   */
  async getRoomTypeByName(req, res) {
    try {
      const roomType = await RoomType.findOne({
        where: { name: req.params.name }
      });

      if (!roomType) {
        return res.status(404).json({
          success: false,
          message: 'Room type not found'
        });
      }

      res.status(200).json({
        success: true,
        data: roomType
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new RoomTypeController();
