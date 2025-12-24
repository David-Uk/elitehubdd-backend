import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      // Feedback belongs to a guest
      Feedback.belongsTo(models.Guest, {
        foreignKey: 'guestId',
        as: 'guest'
      });
      
      // Feedback can be related to a reservation
      Feedback.belongsTo(models.Reservation, {
        foreignKey: 'reservationId',
        as: 'reservation'
      });
    }

    // Calculate average rating
    getAverageRating() {
      const ratings = [
        this.cleanlinessRating,
        this.serviceRating,
        this.facilitiesRating,
        this.valueRating,
        this.locationRating
      ].filter(r => r !== null);
      
      return ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;
    }
  }

  Feedback.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    guestId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'guest_id'
    },
    reservationId: {
      type: DataTypes.UUID,
      field: 'reservation_id'
    },
    overallRating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      },
      field: 'overall_rating'
    },
    cleanlinessRating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      },
      field: 'cleanliness_rating'
    },
    serviceRating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      },
      field: 'service_rating'
    },
    facilitiesRating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      },
      field: 'facilities_rating'
    },
    valueRating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      },
      field: 'value_rating'
    },
    locationRating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      },
      field: 'location_rating'
    },
    comments: {
      type: DataTypes.TEXT
    },
    wouldRecommend: {
      type: DataTypes.BOOLEAN,
      field: 'would_recommend'
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'published', 'archived'),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedbacks',
    underscored: true,
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['guest_id']
      },
      {
        fields: ['reservation_id']
      },
      {
        fields: ['overall_rating']
      },
      {
        fields: ['status']
      }
    ]
  });

  return Feedback;
};
