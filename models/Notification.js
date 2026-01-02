import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Notification belongs to a user (if using User model)
      Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Notification belongs to a staff member (since both exist)
      Notification.belongsTo(models.Staff, {
        foreignKey: 'staffId',
        as: 'staff'
      });
    }
  }

  Notification.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'staff',
        key: 'id'
      },
      field: 'staff_id'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Identifier for the action performed (e.g., CREATE_RESERVATION)'
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'error', 'success', 'system'),
      defaultValue: 'info',
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Extra data related to the action (e.g., request body, changed fields)'
    },
    targetRoles: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false,
      field: 'target_roles',
      comment: 'List of roles that can view this notification'
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ip_address'
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'user_agent'
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['staff_id']
      },
      {
        fields: ['action']
      },
      {
        fields: ['type']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Notification;
};
