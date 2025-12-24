import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class InventoryStock extends Model {
    static associate(models) {
      // Stock entry belongs to an inventory item
      InventoryStock.belongsTo(models.InventoryItem, {
        foreignKey: 'inventoryItemId',
        as: 'item'
      });
    }
  }

  InventoryStock.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'inventory_item_id'
    },
    batchNumber: {
      type: DataTypes.STRING,
      field: 'batch_number'
    },
    dateReceived: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'date_received'
    },
    quantityReceived: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'quantity_received'
    },
    quantityAllocated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'quantity_allocated'
    },
    dateAllocated: {
      type: DataTypes.DATE,
      field: 'date_allocated'
    },
    availableQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'available_quantity'
    },
    inStock: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'in_stock'
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      field: 'expiry_date'
    },
    supplier: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'InventoryStock',
    tableName: 'inventory_stocks',
    underscored: true,
    timestamps: true,
    paranoid: true,
    hooks: {
      beforeSave: (instance) => {
        // Auto-calculate available quantity
        instance.availableQuantity = instance.quantityReceived - instance.quantityAllocated;
        // Auto-update inStock status
        instance.inStock = instance.availableQuantity > 0;
        
        // Update date allocated if quantity allocated changed
        if (instance.changed('quantityAllocated') && instance.quantityAllocated > 0) {
          instance.dateAllocated = new Date();
        }
      }
    },
    indexes: [
      {
        fields: ['inventory_item_id']
      },
      {
        fields: ['batch_number']
      },
      {
        fields: ['in_stock']
      },
      {
        fields: ['date_received']
      },
      {
        fields: ['expiry_date']
      }
    ]
  });

  return InventoryStock;
};
