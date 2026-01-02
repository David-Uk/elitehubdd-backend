import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrderBatch extends Model {
    static associate(models) {
      // Batch belongs to staff who created it
      OrderBatch.belongsTo(models.Staff, {
        foreignKey: 'staffId',
        as: 'staff'
      });

      // Batch has many restaurant orders
      OrderBatch.hasMany(models.RestaurantOrder, {
        foreignKey: 'batchId',
        as: 'orders'
      });

      // Batch has many batch sources
      OrderBatch.hasMany(models.BatchSource, {
        foreignKey: 'batchId',
        as: 'sources'
      });
    }
  }

  OrderBatch.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    batchId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'batch_id'
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'staff_id'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
    totalItems: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_items'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_amount'
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    serviceCharge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'service_charge'
    },
    notes: {
      type: DataTypes.TEXT
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completed_at'
    }
  }, {
    sequelize,
    modelName: 'OrderBatch',
    tableName: 'order_batches',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['batch_id']
      },
      {
        fields: ['staff_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['status', 'created_at']
      }
    ]
  });

  return OrderBatch;
};
