const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

// Import models
const User = require('./User')(sequelize);
const Drug = require('./Drug')(sequelize);
const Prescription = require('./Prescription')(sequelize);
const SideEffect = require('./SideEffect')(sequelize);
const DrugInteraction = require('./DrugInteraction')(sequelize);
const AnalyticsAlert = require('./AnalyticsAlert')(sequelize);

// Define associations
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

module.exports = {
  sequelize,
  User,
  Drug,
  Prescription,
  SideEffect,
  DrugInteraction,
  AnalyticsAlert
};
