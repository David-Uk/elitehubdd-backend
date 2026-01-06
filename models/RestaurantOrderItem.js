import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class RestaurantOrderItem extends Model {
    static associate(models) {
      // Order item belongs to an order
      RestaurantOrderItem.belongsTo(models.RestaurantOrder, {
        foreignKey: 'orderId',
        as: 'order'
      });
      
      // Order item belongs to a menu item
      RestaurantOrderItem.belongsTo(models.MenuItem, {
        foreignKey: 'menuItemId',
        as: 'menuItem'
      });
    }
  }

  RestaurantOrderItem.init({
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
    menuItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'menu_item_id'
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
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      field: 'special_instructions'
    },
    status: {
      type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'RestaurantOrderItem',
    tableName: 'restaurant_order_items',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['menu_item_id']
      }
    ]
  });

  return RestaurantOrderItem;
};
