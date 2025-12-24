import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class MenuItem extends Model {
    static associate(models) {
      // MenuItem has many restaurant order items
      MenuItem.hasMany(models.RestaurantOrderItem, {
        foreignKey: 'menuItemId',
        as: 'orderItems'
      });
    }

    // Check if item is available
    isAvailable() {
      return this.isAvailable && this.stock > 0;
    }
  }

  MenuItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.ENUM(
        'appetizer',
        'main_course',
        'dessert',
        'beverage',
        'breakfast',
        'lunch',
        'dinner'
      ),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      comment: 'Cost to prepare'
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      comment: 'Time in minutes',
      field: 'preparation_time'
    },
    cuisine: {
      type: DataTypes.STRING
    },
    isVegetarian: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_vegetarian'
    },
    isVegan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_vegan'
    },
    allergens: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    productImage: {
      type: DataTypes.STRING,
      field: 'product_image'
    },
    // Removed virtual 'image' field to fix Sequelize sync error
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_available'
    }
  }, {
    sequelize,
    modelName: 'MenuItem',
    tableName: 'menu_items',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['category']
      },
      {
        fields: ['is_available']
      }
    ]
  });

  return MenuItem;
};
