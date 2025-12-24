import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class BarOrder extends Model {
    static associate(models) {
      // Order belongs to a reservation
      BarOrder.belongsTo(models.Reservation, {
        foreignKey: 'reservationId',
        as: 'reservation'
      });
      
      // Order belongs to staff who took it
      BarOrder.belongsTo(models.Staff, {
        foreignKey: 'staffId',
        as: 'staff'
      });
      
      // Order has many order items
      BarOrder.hasMany(models.BarOrderItem, {
        foreignKey: 'orderId',
        as: 'items'
      });
    }
  }

  BarOrder.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'order_number'
    },
    reservationId: {
      type: DataTypes.UUID,
      field: 'reservation_id'
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'staff_id'
    },
    tableNumber: {
      type: DataTypes.STRING,
      field: 'table_number'
    },
    orderType: {
      type: DataTypes.ENUM('bar', 'room_service'),
      defaultValue: 'bar',
      field: 'order_type'
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'preparing',
        'ready',
        'served',
        'completed',
        'cancelled'
      ),
      defaultValue: 'pending',
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
      defaultValue: 'pending',
      field: 'payment_status'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'room_charge', 'mobile_money'),
      field: 'payment_method'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'BarOrder',
    tableName: 'bar_orders',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['order_number']
      },
      {
        fields: ['reservation_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['payment_status', 'created_at']
      }
    ]
  });

  return BarOrder;
};
