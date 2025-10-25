const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DrugInteraction = sequelize.define('DrugInteraction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    drugId1: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Drugs',
        key: 'id'
      }
    },
    drugId2: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Drugs',
        key: 'id'
      }
    },
    severity: {
      type: DataTypes.ENUM('minor', 'moderate', 'major', 'contraindicated'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    clinicalEffect: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    management: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    evidenceLevel: {
      type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor'),
      allowNull: true
    },
    isDetectedByAnalytics: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this interaction was detected by our analytics system'
    },
    confidenceScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 1
      }
    }
  }, {
    indexes: [
      {
        fields: ['drugId1', 'drugId2'],
        unique: true
      },
      {
        fields: ['severity']
      },
      {
        fields: ['isDetectedByAnalytics']
      }
    ]
  });

  return DrugInteraction;
};
