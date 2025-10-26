const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('doctor', 'patient'),
    allowNull: false
  },
  dateOfBirth: DataTypes.DATE,
  phone: DataTypes.STRING,
  address: DataTypes.TEXT,
  medicalLicense: DataTypes.STRING,
  specialization: DataTypes.STRING,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: DataTypes.DATE
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Drug Model
const Drug = sequelize.define('Drug', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  genericName: DataTypes.STRING,
  manufacturer: DataTypes.STRING,
  drugClass: DataTypes.STRING,
  description: DataTypes.TEXT,
  commonSideEffects: DataTypes.JSON,
  contraindications: DataTypes.JSON,
  dosageForms: DataTypes.JSON,
  fdaApprovalDate: DataTypes.DATE,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Prescription Model
const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  dosage: DataTypes.STRING,
  frequency: DataTypes.STRING,
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  instructions: DataTypes.TEXT,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// SideEffect Model
const SideEffect = sequelize.define('SideEffect', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('mild', 'moderate', 'severe'),
    allowNull: false
  },
  isConcerning: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// DrugInteraction Model
const DrugInteraction = sequelize.define('DrugInteraction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  severity: {
    type: DataTypes.ENUM('minor', 'moderate', 'major', 'severe'),
    allowNull: false
  },
  description: DataTypes.TEXT,
  clinicalEffect: DataTypes.TEXT,
  management: DataTypes.TEXT,
  evidenceLevel: DataTypes.STRING,
  isDetectedByAnalytics: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  confidenceScore: DataTypes.FLOAT
});

// AnalyticsAlert Model
const AnalyticsAlert = sequelize.define('AnalyticsAlert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  alertType: {
    type: DataTypes.ENUM('side_effect_spike', 'drug_interaction'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false
  },
  affectedPatientCount: DataTypes.INTEGER,
  confidenceScore: DataTypes.FLOAT,
  dataPoints: DataTypes.JSON,
  recommendations: DataTypes.JSON,
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Define Associations
User.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
User.hasMany(Prescription, { foreignKey: 'doctorId', as: 'doctorPrescriptions' });

Drug.hasMany(Prescription, { foreignKey: 'drugId', as: 'prescriptions' });
Drug.hasMany(SideEffect, { foreignKey: 'drugId', as: 'sideEffects' });
Drug.belongsToMany(Drug, { 
  through: DrugInteraction, 
  as: 'interactsWith', 
  foreignKey: 'drugId1',
  otherKey: 'drugId2'
});

Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Prescription.belongsTo(Drug, { foreignKey: 'drugId', as: 'drug' });
Prescription.hasMany(SideEffect, { foreignKey: 'prescriptionId', as: 'sideEffects' });

SideEffect.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
SideEffect.belongsTo(Drug, { foreignKey: 'drugId', as: 'drug' });
SideEffect.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

// Add instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.updatePassword = async function(newPassword) {
  this.password = await bcrypt.hash(newPassword, 12);
  return this.save();
};

// Add class methods
User.findByEmail = async function(email) {
  return await this.findOne({ where: { email } });
};

module.exports = {
  sequelize,
  User,
  Drug,
  Prescription,
  SideEffect,
  DrugInteraction,
  AnalyticsAlert
};