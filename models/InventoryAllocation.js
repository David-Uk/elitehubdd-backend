import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class InventoryAllocation extends Model {
    static associate(models) {
      // Allocation belongs to an inventory item
      InventoryAllocation.belongsTo(models.InventoryItem, {
        foreignKey: "itemId",
        as: "item",
      });

      // Allocation belongs to a department
      InventoryAllocation.belongsTo(models.Department, {
        foreignKey: "departmentId",
        as: "departmentInfo",
      });
    }
  }

  InventoryAllocation.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      itemId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "item_id",
        references: {
          model: "inventory_items",
          key: "id",
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      department: {
        type: DataTypes.ENUM(
          "reception",
          "housekeeping",
          "maintenance",
          "management",
          "restaurant"
        ),
        allowNull: true, // Changed to nullable since we're migrating to departmentId
      },
      departmentId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "department_id",
        references: {
          model: "departments",
          key: "id",
        },
        comment: "Foreign key to departments table"
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "InventoryAllocation",
      tableName: "inventory_allocations",
      underscored: true,
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          fields: ["item_id"],
        },
        {
          fields: ["department"],
        },
        {
          fields: ["created_at"],
        },
      ],
    }
  );

  return InventoryAllocation;
};
