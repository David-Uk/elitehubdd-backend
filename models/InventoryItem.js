import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class InventoryItem extends Model {
    static associate(models) {
      // Inventory item has many stock entries
      InventoryItem.hasMany(models.InventoryStock, {
        foreignKey: 'inventoryItemId',
        as: 'stockEntries'
      });

      // Inventory item has many allocations
      InventoryItem.hasMany(models.InventoryAllocation, {
        foreignKey: 'itemId',
        as: 'allocations'
      });

      // Inventory item has many additions
      InventoryItem.hasMany(models.InventoryAddition, {
        foreignKey: 'itemId',
        as: 'additions'
      });

      // Inventory item has many subtractions
      InventoryItem.hasMany(models.InventorySubtraction, {
        foreignKey: 'itemId',
        as: 'subtractions'
      });
    }
  }

  InventoryItem.init({
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
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'cost_price'
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'selling_price'
    },
    sku: {
      type: DataTypes.STRING,
      unique: true
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'pcs'
    },
    reorderLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      field: 'reorder_level'
    }
  }, {
    sequelize,
    modelName: 'InventoryItem',
    tableName: 'inventory_items',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['category']
      },
      {
        unique: true,
        fields: ['sku']
      }
    ]
  });

  return InventoryItem;
};
