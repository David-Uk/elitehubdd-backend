import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      // define association here
      // Example:
      // User.hasMany(models.Post, {
      //   foreignKey: 'userId',
      //   as: 'posts'
      // });
    }

    // Instance method example
    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.password; // Don't expose password in JSON
      return values;
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'moderator'),
      defaultValue: 'user'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    paranoid: true, // Soft deletes
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['username']
      }
    ]
  });

  return User;
};
