const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AnalyticsAlert = sequelize.define('AnalyticsAlert', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    alertType: {
      type: DataTypes.ENUM('side_effect_spike', 'drug_interaction', 'unexpected_reaction', 'dosage_concern'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false
    },
    drugIds: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of drug IDs involved in the alert'
    },
    affectedPatientCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    confidenceScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 1
      }
    },
    dataPoints: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Supporting data and statistics for the alert'
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resolvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolutionNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isNotified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    indexes: [
      {
        fields: ['alertType']
      },
      {
        fields: ['severity']
      },
      {
        fields: ['isResolved']
      },
      {
        fields: ['isNotified']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return AnalyticsAlert;
};
