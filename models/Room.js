import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      // Room belongs to a room type
      Room.belongsTo(models.RoomType, {
        foreignKey: 'roomTypeId',
        as: 'roomType'
      });
      
      // Room can have many reservations
      Room.hasMany(models.Reservation, {
        foreignKey: 'roomId',
        as: 'reservations'
      });
    }

    // Check if room is available
    isAvailable() {
      return this.status === 'available';
    }
  }

  Room.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'room_number'
    },
    roomTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'room_type_id'
    },
    status: {
      type: DataTypes.ENUM(
        'available',
        'occupied',
        'maintenance',
        'cleaning',
        'reserved'
      ),
      defaultValue: 'available',
      allowNull: false
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'rooms',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['room_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['room_type_id']
      }
    ]
  });

  return Room;
};
