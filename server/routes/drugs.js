const express = require('express');
const { Drug } = require('../models');
const { requireDoctor } = require('../middleware/auth');

const router = express.Router();

// Get all drugs (accessible by both doctors and patients)
router.get('/', async (req, res) => {
  try {
    const { search, drugClass, page = 1, limit = 20 } = req.query;
    const { Op } = require('sequelize');
    
    // Build where clause
    const whereClause = { isActive: true };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { genericName: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (drugClass) {
      whereClause.drugClass = drugClass;
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows: drugs } = await Drug.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      drugs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get drugs error:', error);
    res.status(500).json({ error: 'Failed to fetch drugs' });
  }
});

// Get drug by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const drug = await Drug.findByPk(id);
    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    res.json({ drug });
  } catch (error) {
    console.error('Get drug error:', error);
    res.status(500).json({ error: 'Failed to fetch drug' });
  }
});

// Create new drug (doctors only)
router.post('/', requireDoctor, async (req, res) => {
  try {
    const {
      name,
      genericName,
      manufacturer,
      drugClass,
      description,
      commonSideEffects,
      contraindications,
      dosageForms,
      fdaApprovalDate,
      blackBoxWarning
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Drug name is required' });
    }

    // Check if drug already exists
    const existingDrug = await Drug.findOne({ where: { name } });
    if (existingDrug) {
      return res.status(409).json({ error: 'Drug already exists' });
    }

    const drug = await Drug.create({
      name,
      genericName,
      manufacturer,
      drugClass,
      description,
      commonSideEffects: commonSideEffects || [],
      contraindications: contraindications || [],
      dosageForms: dosageForms || [],
      fdaApprovalDate,
      blackBoxWarning
    });

    res.status(201).json({
      message: 'Drug created successfully',
      drug
    });
  } catch (error) {
    console.error('Create drug error:', error);
    res.status(500).json({ error: 'Failed to create drug' });
  }
});

// Update drug (doctors only)
router.put('/:id', requireDoctor, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const drug = await Drug.findByPk(id);
    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    await drug.update(updateData);

    res.json({
      message: 'Drug updated successfully',
      drug
    });
  } catch (error) {
    console.error('Update drug error:', error);
    res.status(500).json({ error: 'Failed to update drug' });
  }
});

// Get drug classes
router.get('/classes/list', async (req, res) => {
  try {
    const drugClasses = await Drug.findAll({
      attributes: ['drugClass'],
      where: {
        drugClass: { [require('sequelize').Op.ne]: null },
        isActive: true
      },
      group: ['drugClass'],
      order: [['drugClass', 'ASC']]
    });

    const classes = drugClasses.map(dc => dc.drugClass).filter(Boolean);

    res.json({ drugClasses: classes });
  } catch (error) {
    console.error('Get drug classes error:', error);
    res.status(500).json({ error: 'Failed to fetch drug classes' });
  }
});

module.exports = router;
