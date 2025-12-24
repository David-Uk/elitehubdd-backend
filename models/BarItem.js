import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class BarItem extends Model {
    static associate(models) {
      // BarItem has many bar order items
      BarItem.hasMany(models.BarOrderItem, {
        foreignKey: 'barItemId',
        as: 'orderItems'
      });
    }

    // Check if item is available
    isAvailable() {
      return this.isAvailable && this.stock > 0;
    }
  }

  BarItem.init({
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
        'beer',
        'wine',
        'spirits',
        'cocktail',
        'soft_drink',
        'juice',
        'water',
        'other'
      ),
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      comment: 'Cost price'
    },
    volume: {
      type: DataTypes.STRING,
      comment: 'e.g., 330ml, 750ml'
    },
    alcoholContent: {
      type: DataTypes.DECIMAL(4, 2),
      comment: 'Alcohol percentage',
      field: 'alcohol_content'
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    reorderLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      field: 'reorder_level'
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
    modelName: 'BarItem',
    tableName: 'bar_items',
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

  return BarItem;
};
