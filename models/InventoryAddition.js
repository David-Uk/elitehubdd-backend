import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class InventoryAddition extends Model {
    static associate(models) {
      // Addition belongs to an inventory item
      InventoryAddition.belongsTo(models.InventoryItem, {
        foreignKey: 'itemId',
        as: 'item'
      });
    }
  }

  InventoryAddition.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'item_id',
      references: {
        model: 'inventory_items',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    supplier: {
      type: DataTypes.STRING,
      allowNull: true
    },
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'batch_number'
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'expiry_date'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'InventoryAddition',
    tableName: 'inventory_additions',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['item_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['batch_number']
      }
    ]
  });

  return InventoryAddition;
};
