import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class BatchSource extends Model {
    static associate(models) {
      // Batch source belongs to a batch
      BatchSource.belongsTo(models.OrderBatch, {
        foreignKey: 'batchId',
        as: 'batch'
      });

      // Batch source has many restaurant orders
      BatchSource.hasMany(models.RestaurantOrder, {
        foreignKey: 'batchSourceId',
        as: 'orders'
      });
    }
  }

  BatchSource.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    batchId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'batch_id'
    },
    sourceId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'source_id'
    },
    sourceName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'source_name'
    },
    sourceType: {
      type: DataTypes.ENUM('room', 'table', 'facility'),
      allowNull: false,
      field: 'source_type'
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'BatchSource',
    tableName: 'batch_sources',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['batch_id']
      },
      {
        fields: ['source_type']
      },
      {
        fields: ['source_id']
      }
    ]
  });

  return BatchSource;
};
