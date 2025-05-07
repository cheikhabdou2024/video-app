// backend/src/controllers/authController.js
require('dotenv').config();
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
  try {
    // Check for validation errors from express-validator middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email: req.body.email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ where: { username: req.body.username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // 1. Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // 2. Create user
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    // 3. Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 4. Send response
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      token
    });

  } catch (error) {
    console.error('Registration failed:', error);
    
    // Send more specific error messages
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    // Check for validation errors from express-validator middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 1. Find user by email
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. Compare passwords
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 4. Send response
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      token
    });

  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

module.exports = {
  register,
  login
};