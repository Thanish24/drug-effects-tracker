const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SideEffect = sequelize.define('SideEffect', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    prescriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Prescriptions',
        key: 'id'
      }
    },
    drugId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Drugs',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000]
      }
    },
    severity: {
      type: DataTypes.ENUM('mild', 'moderate', 'severe'),
      allowNull: false
    },
    onsetDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in days'
    },
    isOngoing: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    impactOnDailyLife: {
      type: DataTypes.ENUM('none', 'minimal', 'moderate', 'significant', 'severe'),
      allowNull: false
    },
    llmAnalysis: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'LLM analysis results including concern level and recommendations'
    },
    isConcerning: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    doctorNotified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    doctorResponse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this side effect is included in anonymous analytics'
    }
  }, {
    indexes: [
      {
        fields: ['prescriptionId']
      },
      {
        fields: ['drugId']
      },
      {
        fields: ['severity']
      },
      {
        fields: ['isConcerning']
      },
      {
        fields: ['isAnonymous']
      },
      {
        fields: ['onsetDate']
      }
    ]
  });

  return SideEffect;
};
