import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class RoomType extends Model {
    static associate(models) {
      // RoomType has many rooms
      RoomType.hasMany(models.Room, {
        foreignKey: 'roomTypeId',
        as: 'rooms'
      });
    }
  }

  RoomType.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'base_price'
    },
    amenities: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    bedType: {
      type: DataTypes.ENUM('single', 'double', 'queen', 'king', 'twin'),
      field: 'bed_type'
    },
    numberOfBeds: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'number_of_beds'
    },
    size: {
      type: DataTypes.INTEGER,
      comment: 'Size in square meters'
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'RoomType',
    tableName: 'room_types',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  return RoomType;
};
