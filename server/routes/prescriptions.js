const express = require('express');
const { Prescription, User, Drug } = require('../models/firebaseModels');
const { requireDoctor, requirePatient } = require('../middleware/auth');

const router = express.Router();

// Get prescriptions (role-based)
router.get('/', async (req, res) => {
  try {
    const { patientId, status = 'active', page = 1, limit = 20 } = req.query;
    
    let whereClause = {};
    
    if (req.user.role === 'patient') {
      whereClause.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      if (patientId) {
        whereClause.patientId = patientId;
      }
      whereClause.doctorId = req.user.id;
    }

    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: prescriptions } = await Prescription.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'email', 'specialization']
        },
        {
          model: Drug,
          as: 'drug',
          attributes: ['id', 'name', 'genericName', 'drugClass', 'commonSideEffects']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      prescriptions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Get prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const prescription = await Prescription.findByPk(id, {
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'email', 'specialization']
        },
        {
          model: Drug,
          as: 'drug',
          attributes: ['id', 'name', 'genericName', 'drugClass', 'commonSideEffects', 'contraindications']
        }
      ]
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Check permissions
    if (req.user.role === 'patient' && prescription.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'doctor' && prescription.doctorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ prescription });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// Create prescription (doctors only)
router.post('/', requireDoctor, async (req, res) => {
  try {
    const {
      patientId,
      drugId,
      dosage,
      frequency,
      instructions,
      startDate,
      endDate,
      refillsRemaining,
      totalRefills,
      notes
    } = req.body;

    if (!patientId || !drugId || !dosage || !frequency || !startDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify patient exists and is a patient
    const patient = await User.findOne({
      where: { id: patientId, role: 'patient' }
    });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Verify drug exists
    const drug = await Drug.findByPk(drugId);
    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user.id,
      drugId,
      dosage,
      frequency,
      instructions,
      startDate,
      endDate,
      refillsRemaining: refillsRemaining || 0,
      totalRefills: totalRefills || 0,
      notes
    });

    // Fetch the created prescription with relations
    const createdPrescription = await Prescription.findByPk(prescription.id, {
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'email', 'specialization']
        },
        {
          model: Drug,
          as: 'drug',
          attributes: ['id', 'name', 'genericName', 'drugClass']
        }
      ]
    });

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: createdPrescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
});

// Update prescription (doctors only)
router.put('/:id', requireDoctor, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const prescription = await Prescription.findByPk(id);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Check if doctor owns this prescription
    if (prescription.doctorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prescription.update(updateData);

    res.json({
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ error: 'Failed to update prescription' });
  }
});

// Deactivate prescription (doctors only)
router.put('/:id/deactivate', requireDoctor, async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByPk(id);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (prescription.doctorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prescription.update({ isActive: false });

    res.json({
      message: 'Prescription deactivated successfully',
      prescription
    });
  } catch (error) {
    console.error('Deactivate prescription error:', error);
    res.status(500).json({ error: 'Failed to deactivate prescription' });
  }
});

// Get patients for doctor
router.get('/patients/list', requireDoctor, async (req, res) => {
  try {
    const patients = await User.findAll({
      where: { role: 'patient', isActive: true },
      attributes: ['id', 'firstName', 'lastName', 'email', 'dateOfBirth'],
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({ patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

module.exports = router;
