const express = require('express');
const { AnalyticsAlert, SideEffect, Drug, DrugInteraction } = require('../models/firebaseModels');
const AnalyticsService = require('../services/analyticsService');
const { requireDoctor } = require('../middleware/auth');

const router = express.Router();

// Get analytics dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { timeWindow = 30 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeWindow));

    // Get basic statistics
    const totalSideEffects = await SideEffect.count({
      where: {
        isAnonymous: true,
        createdAt: { [require('sequelize').Op.gte]: cutoffDate }
      }
    });

    const concerningSideEffects = await SideEffect.count({
      where: {
        isAnonymous: true,
        isConcerning: true,
        createdAt: { [require('sequelize').Op.gte]: cutoffDate }
      }
    });

    const activeAlerts = await AnalyticsAlert.count({
      where: { isResolved: false }
    });

    const drugInteractions = await DrugInteraction.count({
      where: { isDetectedByAnalytics: true }
    });

    // Get side effects by severity
    const severityStats = await SideEffect.findAll({
      attributes: [
        'severity',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: {
        isAnonymous: true,
        createdAt: { [require('sequelize').Op.gte]: cutoffDate }
      },
      group: ['severity']
    });

    // Get top drugs by side effects
    const topDrugs = await SideEffect.findAll({
      attributes: [
        'drugId',
        [require('sequelize').fn('COUNT', require('sequelize').col('SideEffect.id')), 'sideEffectCount']
      ],
      include: [{
        model: Drug,
        as: 'drug',
        attributes: ['name']
      }],
      where: {
        isAnonymous: true,
        createdAt: { [require('sequelize').Op.gte]: cutoffDate }
      },
      group: ['drugId', 'drug.id', 'drug.name'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('SideEffect.id')), 'DESC']],
      limit: 10
    });

    res.json({
      timeWindow: parseInt(timeWindow),
      statistics: {
        totalSideEffects,
        concerningSideEffects,
        activeAlerts,
        drugInteractions,
        concernRate: totalSideEffects > 0 ? (concerningSideEffects / totalSideEffects) : 0
      },
      severityStats,
      topDrugs,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get analytics alerts
router.get('/alerts', async (req, res) => {
  try {
    const { severity, isResolved, page = 1, limit = 20 } = req.query;
    
    let whereClause = {};
    
    if (severity) {
      whereClause.severity = severity;
    }
    
    if (isResolved !== undefined) {
      whereClause.isResolved = isResolved === 'true';
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: alerts } = await AnalyticsAlert.findAndCountAll({
      where: whereClause,
      include: [{
        model: Drug,
        as: 'drugs',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      alerts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get analytics alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alert by ID
router.get('/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await AnalyticsAlert.findByPk(id, {
      include: [{
        model: Drug,
        as: 'drugs',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }]
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ alert });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// Resolve alert (doctors only)
router.put('/alerts/:id/resolve', requireDoctor, async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const alert = await AnalyticsAlert.findByPk(id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await alert.update({
      isResolved: true,
      resolvedBy: req.user.id,
      resolvedAt: new Date(),
      resolutionNotes
    });

    res.json({
      message: 'Alert resolved successfully',
      alert
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// Run analytics analysis (doctors only)
router.post('/analyze', requireDoctor, async (req, res) => {
  try {
    const analysis = await AnalyticsService.runPeriodicAnalysis();
    
    res.json({
      message: 'Analytics analysis completed',
      analysis
    });
  } catch (error) {
    console.error('Run analytics error:', error);
    res.status(500).json({ error: 'Failed to run analytics analysis' });
  }
});

// Get drug interaction data
router.get('/interactions', async (req, res) => {
  try {
    const { drugId, severity } = req.query;
    
    let whereClause = {};
    
    if (drugId) {
      whereClause[require('sequelize').Op.or] = [
        { drugId1: drugId },
        { drugId2: drugId }
      ];
    }
    
    if (severity) {
      whereClause.severity = severity;
    }

    const interactions = await DrugInteraction.findAll({
      where: whereClause,
      include: [
        {
          model: Drug,
          as: 'drug1',
          attributes: ['id', 'name', 'genericName']
        },
        {
          model: Drug,
          as: 'drug2',
          attributes: ['id', 'name', 'genericName']
        }
      ],
      order: [['severity', 'DESC'], ['confidenceScore', 'DESC']]
    });

    res.json({ interactions });
  } catch (error) {
    console.error('Get drug interactions error:', error);
    res.status(500).json({ error: 'Failed to fetch drug interactions' });
  }
});

// Get side effect trends
router.get('/trends', async (req, res) => {
  try {
    const { drugId, timeWindow = 30 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeWindow));

    let whereClause = {
      isAnonymous: true,
      createdAt: { [require('sequelize').Op.gte]: cutoffDate }
    };

    if (drugId) {
      whereClause.drugId = drugId;
    }

    // Get daily trends
    const dailyTrends = await SideEffect.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('COUNT', require('sequelize').col('CASE WHEN "isConcerning" = true THEN 1 END')), 'concerningCount']
      ],
      where: whereClause,
      group: [require('sequelize').fn('DATE', require('sequelize').col('createdAt'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']]
    });

    // Get severity trends
    const severityTrends = await SideEffect.findAll({
      attributes: [
        'severity',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: whereClause,
      group: ['severity'],
      order: [['severity', 'ASC']]
    });

    res.json({
      timeWindow: parseInt(timeWindow),
      dailyTrends,
      severityTrends,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

module.exports = router;
