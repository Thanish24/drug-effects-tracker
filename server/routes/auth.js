const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/firebaseModels');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, dateOfBirth, phone, address, medicalLicense, specialization } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    if (!['doctor', 'patient'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const registerUserModel = new User();
    const existingUser = await registerUserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Validate doctor-specific fields
    if (role === 'doctor' && !medicalLicense) {
      return res.status(400).json({ error: 'Medical license required for doctors' });
    }

    // Create user
    const userData = {
      email,
      password,
      firstName,
      lastName,
      role,
      dateOfBirth,
      phone,
      address
    };

    if (role === 'doctor') {
      userData.medicalLicense = medicalLicense;
      userData.specialization = specialization;
    }

    const user = await registerUserModel.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user by email
    const loginUserModel = new User();
    const user = await loginUserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Validate password
    const isValidPassword = await loginUserModel.validatePassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await loginUserModel.update(user.id, { lastLogin: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const profileUserModel = new User();
    const user = await profileUserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone,
        address: user.address,
        medicalLicense: user.medicalLicense,
        specialization: user.specialization,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, specialization } = req.body;
    
    const updateUserModel = new User();
    const user = await updateUserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (user.role === 'doctor' && specialization) updateData.specialization = specialization;

    await updateUserModel.update(user.id, updateData);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        address: user.address,
        specialization: user.specialization
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const passwordUserModel = new User();
    const user = await passwordUserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await passwordUserModel.validatePassword(user, currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await passwordUserModel.updatePassword(user.id, newPassword);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
