import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class BarOrderItem extends Model {
    static associate(models) {
      // Order item belongs to an order
      BarOrderItem.belongsTo(models.BarOrder, {
        foreignKey: 'orderId',
        as: 'order'
      });
      
      // Order item belongs to a bar item
      BarOrderItem.belongsTo(models.BarItem, {
        foreignKey: 'barItemId',
        as: 'barItem'
      });
    }
  }

  BarOrderItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id'
    },
    barItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'bar_item_id'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'unit_price'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_price'
    }
  }, {
    sequelize,
    modelName: 'BarOrderItem',
    tableName: 'bar_order_items',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['bar_item_id']
      }
    ]
  });

  return BarOrderItem;
};
