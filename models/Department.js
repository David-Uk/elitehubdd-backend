import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Department extends Model {
    static associate(models) {
      // Department has many staff members
      Department.hasMany(models.Staff, {
        foreignKey: 'departmentId',
        as: 'staff'
      });

      // Department has many inventory allocations
      Department.hasMany(models.InventoryAllocation, {
        foreignKey: 'departmentId',
        as: 'inventoryAllocations'
      });
    }

    // Instance method to check if department is active
    isActive() {
      return this.status === 'active';
    }
  }

  Department.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 100],
        notEmpty: true
      }
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 50],
        notEmpty: true,
        isLowercase: true,
        is: /^[a-z_]+$/ // Only lowercase letters and underscores
      },
      comment: 'Unique code for the department (e.g., reception, housekeeping)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false
    },
    headOfDepartment: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'head_of_department',
      references: {
        model: 'staff',
        key: 'id'
      },
      comment: 'Staff member who heads this department'
    },
    budget: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0.00,
      validate: {
        min: 0
      },
      comment: 'Annual budget allocated to this department'
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'contact_email',
      validate: {
        isEmail: true
      }
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'contact_phone',
      validate: {
        is: /^[0-9+\-\s()]+$/
      }
    }
  }, {
    sequelize,
    modelName: 'Department',
    tableName: 'departments',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        unique: true,
        fields: ['code']
      },
      {
        fields: ['status']
      },
      {
        fields: ['head_of_department']
      }
    ]
  });

  return Department;
};
