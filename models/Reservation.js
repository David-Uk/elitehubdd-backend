import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Reservation extends Model {
    static associate(models) {
      // Reservation belongs to a guest
      Reservation.belongsTo(models.Guest, {
        foreignKey: 'guestId',
        as: 'guest'
      });
      
      // Reservation belongs to a room
      Reservation.belongsTo(models.Room, {
        foreignKey: 'roomId',
        as: 'room'
      });
      
      // Reservation belongs to staff who created it
      Reservation.belongsTo(models.Staff, {
        foreignKey: 'staffId',
        as: 'staff'
      });
      
      // Reservation can have many restaurant orders
      Reservation.hasMany(models.RestaurantOrder, {
        foreignKey: 'reservationId',
        as: 'restaurantOrders'
      });
      
      // Reservation can have many bar orders
      Reservation.hasMany(models.BarOrder, {
        foreignKey: 'reservationId',
        as: 'barOrders'
      });
    }

    // Calculate total nights
    getTotalNights() {
      const checkIn = new Date(this.checkInDate);
      const checkOut = new Date(this.checkOutDate);
      const diffTime = Math.abs(checkOut - checkIn);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Check if reservation is active
    isActive() {
      return this.status === 'checked_in';
    }
  }

  Reservation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    reservationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'reservation_number'
    },
    guestId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'guest_id'
    },
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'room_id'
    },
    staffId: {
      type: DataTypes.UUID,
      field: 'staff_id'
    },
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'check_in_date'
    },
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'check_out_date'
    },
    actualCheckIn: {
      type: DataTypes.DATE,
      field: 'actual_check_in'
    },
    actualCheckOut: {
      type: DataTypes.DATE,
      field: 'actual_check_out'
    },
    numberOfGuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'number_of_guests'
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'checked_in',
        'checked_out',
        'cancelled',
        'no_show'
      ),
      defaultValue: 'pending',
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount'
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'paid_amount'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded'),
      defaultValue: 'pending',
      field: 'payment_status'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'mobile_money'),
      field: 'payment_method'
    },
    specialRequests: {
      type: DataTypes.TEXT,
      field: 'special_requests'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['reservation_number']
      },
      {
        fields: ['guest_id']
      },
      {
        fields: ['room_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['payment_status']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['check_in_date', 'check_out_date']
      }
    ]
  });

  return Reservation;
};
