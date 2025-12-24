import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Guest extends Model {
    static associate(models) {
      // Guest can have many reservations
      Guest.hasMany(models.Reservation, {
        foreignKey: 'guestId',
        as: 'reservations'
      });
      
      // Guest can give many feedbacks
      Guest.hasMany(models.Feedback, {
        foreignKey: 'guestId',
        as: 'feedbacks'
      });
    }

    // Get full name
    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  }

  Guest.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'phone_number',
      validate: {
        is: /^[0-9+\-\s()]+$/
      }
    },
    address: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.STRING
    },
    idType: {
      type: DataTypes.ENUM('passport', 'drivers_license', 'national_id'),
      allowNull: false,
      field: 'id_type'
    },
    idNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'id_number'
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      field: 'date_of_birth'
    },
    nationality: {
      type: DataTypes.STRING
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Guest',
    tableName: 'guests',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['phone_number']
      },
      {
        unique: true,
        fields: ['id_number']
      }
    ]
  });

  return Guest;
};
