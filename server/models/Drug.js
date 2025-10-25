const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Drug = sequelize.define('Drug', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100]
      }
    },
    genericName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    },
    drugClass: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 50]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    commonSideEffects: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    contraindications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    dosageForms: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    fdaApprovalDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    blackBoxWarning: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['drugClass']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  return Drug;
};
