import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Staff extends Model {
    static associate(models) {
      // Staff belongs to a department
      Staff.belongsTo(models.Department, {
        foreignKey: 'departmentId',
        as: 'departmentInfo'
      });

      // Staff can make many reservations
      Staff.hasMany(models.Reservation, {
        foreignKey: 'staffId',
        as: 'reservations'
      });
      
      // Staff can handle many restaurant orders
      Staff.hasMany(models.RestaurantOrder, {
        foreignKey: 'staffId',
        as: 'restaurantOrders'
      });
      
      // Staff can handle many bar orders
      Staff.hasMany(models.BarOrder, {
        foreignKey: 'staffId',
        as: 'barOrders'
      });
    }

    // Instance method to hide password
    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.password;
      return values;
    }

    // Check if user has specific role
    hasRole(role) {
      return this.role === role;
    }

    // Check if user is admin
    isAdmin() {
      return this.role === 'admin';
    }
  }

  Staff.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
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
    phoneNumber: {
      type: DataTypes.STRING,
      field: 'phone_number',
      validate: {
        is: /^[0-9+\-\s()]+$/
      }
    },
    role: {
      type: DataTypes.ENUM(
        'admin',
        'manager',
        'receptionist',
        'housekeeping',
        'restaurant_staff',
        'bar_staff',
        'maintenance'
      ),
      defaultValue: 'receptionist',
      allowNull: false
    },
    department: {
      type: DataTypes.ENUM(
        'reception',
        'housekeeping',
        'maintenance',
        'management',
        'restaurant'
      ),
      allowNull: true, // Changed to nullable since we're migrating to departmentId
      defaultValue: null
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'department_id',
      references: {
        model: 'departments',
        key: 'id'
      },
      comment: 'Foreign key to departments table'
    },
    position: {
      type: DataTypes.STRING,
      field: 'position'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'disabled', 'on leave', 'retired', 'retrenched'),
      defaultValue: 'active',
      allowNull: false
    },
    isActive: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.status === 'active';
      },
      set(value) {
        throw new Error('Do not try to set the `isActive` value!');
      }
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      field: 'hire_date'
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login'
    }
  }, {
    sequelize,
    modelName: 'Staff',
    tableName: 'staff',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['username']
      },
      {
        fields: ['role']
      },
      {
        fields: ['department']
      }
    ]
  });

  return Staff;
};
