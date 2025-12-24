import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class InventorySubtraction extends Model {
    static associate(models) {
      // Subtraction belongs to an inventory item
      InventorySubtraction.belongsTo(models.InventoryItem, {
        foreignKey: 'itemId',
        as: 'item'
      });
    }
  }

  InventorySubtraction.init({
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
    subtractionCause: {
      type: DataTypes.ENUM(
        'damaged',
        'expired',
        'lost',
        'stolen',
        'returned',
        'wastage',
        'other'
      ),
      allowNull: false,
      field: 'subtraction_cause'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'InventorySubtraction',
    tableName: 'inventory_subtractions',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['item_id']
      },
      {
        fields: ['subtraction_cause']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return InventorySubtraction;
};
