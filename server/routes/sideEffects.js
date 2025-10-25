const express = require('express');
const { SideEffect, Prescription, Drug, User } = require('../models/firebaseModels');
const { requirePatient } = require('../middleware/auth');
const LLMService = require('../services/llmService');

const router = express.Router();

// Get side effects for user's prescriptions
router.get('/', async (req, res) => {
  try {
    const { prescriptionId, severity, isConcerning, page = 1, limit = 20 } = req.query;
    
    let whereClause = {};
    
    if (req.user.role === 'patient') {
      // Get user's prescription IDs
      const userPrescriptions = await Prescription.findAll({
        where: { patientId: req.user.id },
        attributes: ['id']
      });
      whereClause.prescriptionId = userPrescriptions.map(p => p.id);
    } else if (req.user.role === 'doctor') {
      if (prescriptionId) {
        whereClause.prescriptionId = prescriptionId;
      }
    }

    if (severity) {
      whereClause.severity = severity;
    }
    
    if (isConcerning !== undefined) {
      whereClause.isConcerning = isConcerning === 'true';
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: sideEffects } = await SideEffect.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Prescription,
          as: 'prescription',
          attributes: ['id', 'dosage', 'frequency'],
          include: [{
            model: User,
            as: 'patient',
            attributes: ['id', 'firstName', 'lastName']
          }]
        },
        {
          model: Drug,
          as: 'drug',
          attributes: ['id', 'name', 'genericName']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      sideEffects,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get side effects error:', error);
    res.status(500).json({ error: 'Failed to fetch side effects' });
  }
});

// Get side effect by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sideEffect = await SideEffect.findByPk(id, {
      include: [
        {
          model: Prescription,
          as: 'prescription',
          include: [{
            model: User,
            as: 'patient',
            attributes: ['id', 'firstName', 'lastName']
          }]
        },
        {
          model: Drug,
          as: 'drug',
          attributes: ['id', 'name', 'genericName', 'commonSideEffects']
        }
      ]
    });

    if (!sideEffect) {
      return res.status(404).json({ error: 'Side effect not found' });
    }

    // Check permissions
    if (req.user.role === 'patient' && sideEffect.prescription.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ sideEffect });
  } catch (error) {
    console.error('Get side effect error:', error);
    res.status(500).json({ error: 'Failed to fetch side effect' });
  }
});

// Create side effect (patients only)
router.post('/', requirePatient, async (req, res) => {
  try {
    const {
      prescriptionId,
      description,
      severity,
      onsetDate,
      duration,
      isOngoing,
      impactOnDailyLife
    } = req.body;

    if (!prescriptionId || !description || !severity || !onsetDate || !impactOnDailyLife) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify prescription belongs to patient
    const prescription = await Prescription.findOne({
      where: { id: prescriptionId, patientId: req.user.id },
      include: [{
        model: Drug,
        as: 'drug',
        attributes: ['id', 'name']
      }]
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Get patient's other medications for LLM analysis
    const otherPrescriptions = await Prescription.findAll({
      where: {
        patientId: req.user.id,
        isActive: true,
        id: { [require('sequelize').Op.ne]: prescriptionId }
      },
      include: [{
        model: Drug,
        as: 'drug',
        attributes: ['name']
      }]
    });

    const otherMedications = otherPrescriptions.map(p => p.drug.name);

    // Create side effect
    const sideEffect = await SideEffect.create({
      prescriptionId,
      drugId: prescription.drugId,
      description,
      severity,
      onsetDate,
      duration,
      isOngoing,
      impactOnDailyLife
    });

    // Analyze with LLM
    try {
      const llmAnalysis = await LLMService.analyzeSideEffect({
        description,
        severity,
        impactOnDailyLife,
        drugName: prescription.drug.name,
        patientAge: req.user.dateOfBirth ? 
          new Date().getFullYear() - new Date(req.user.dateOfBirth).getFullYear() : null,
        otherMedications
      });

      // Update side effect with LLM analysis
      await sideEffect.update({
        llmAnalysis,
        isConcerning: llmAnalysis.isConcerning
      });

      // If concerning, notify doctor via socket.io
      if (llmAnalysis.isConcerning) {
        const io = req.app.get('io');
        io.to(`user_${prescription.doctorId}`).emit('concerning_side_effect', {
          sideEffectId: sideEffect.id,
          patientName: `${req.user.firstName} ${req.user.lastName}`,
          drugName: prescription.drug.name,
          description,
          severity,
          urgency: llmAnalysis.urgency
        });
      }

    } catch (llmError) {
      console.error('LLM analysis error:', llmError);
      // Continue without LLM analysis
    }

    // Fetch the created side effect with relations
    const createdSideEffect = await SideEffect.findByPk(sideEffect.id, {
      include: [
        {
          model: Prescription,
          as: 'prescription',
          include: [{
            model: User,
            as: 'patient',
            attributes: ['id', 'firstName', 'lastName']
          }]
        },
        {
          model: Drug,
          as: 'drug',
          attributes: ['id', 'name', 'genericName']
        }
      ]
    });

    res.status(201).json({
      message: 'Side effect reported successfully',
      sideEffect: createdSideEffect
    });
  } catch (error) {
    console.error('Create side effect error:', error);
    res.status(500).json({ error: 'Failed to report side effect' });
  }
});

// Update side effect (patients only)
router.put('/:id', requirePatient, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const sideEffect = await SideEffect.findByPk(id, {
      include: [{
        model: Prescription,
        as: 'prescription'
      }]
    });

    if (!sideEffect) {
      return res.status(404).json({ error: 'Side effect not found' });
    }

    // Check if patient owns this side effect
    if (sideEffect.prescription.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await sideEffect.update(updateData);

    res.json({
      message: 'Side effect updated successfully',
      sideEffect
    });
  } catch (error) {
    console.error('Update side effect error:', error);
    res.status(500).json({ error: 'Failed to update side effect' });
  }
});

// Doctor response to side effect
router.put('/:id/doctor-response', async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorResponse } = req.body;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can respond to side effects' });
    }

    const sideEffect = await SideEffect.findByPk(id, {
      include: [{
        model: Prescription,
        as: 'prescription'
      }]
    });

    if (!sideEffect) {
      return res.status(404).json({ error: 'Side effect not found' });
    }

    // Check if doctor owns the prescription
    if (sideEffect.prescription.doctorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await sideEffect.update({
      doctorResponse,
      doctorNotified: true
    });

    // Notify patient
    const io = req.app.get('io');
    io.to(`user_${sideEffect.prescription.patientId}`).emit('doctor_response', {
      sideEffectId: sideEffect.id,
      doctorName: `${req.user.firstName} ${req.user.lastName}`,
      response: doctorResponse
    });

    res.json({
      message: 'Response sent successfully',
      sideEffect
    });
  } catch (error) {
    console.error('Doctor response error:', error);
    res.status(500).json({ error: 'Failed to send response' });
  }
});

// Get concerning side effects for doctors
router.get('/concerning/list', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const concerningSideEffects = await SideEffect.findAll({
      where: {
        isConcerning: true,
        doctorNotified: false
      },
      include: [
        {
          model: Prescription,
          as: 'prescription',
          where: { doctorId: req.user.id },
          include: [{
            model: User,
            as: 'patient',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        },
        {
          model: Drug,
          as: 'drug',
          attributes: ['id', 'name', 'genericName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ concerningSideEffects });
  } catch (error) {
    console.error('Get concerning side effects error:', error);
    res.status(500).json({ error: 'Failed to fetch concerning side effects' });
  }
});

module.exports = router;
