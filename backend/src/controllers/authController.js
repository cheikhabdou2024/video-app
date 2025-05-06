require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debug line

const { User } = require('../models/index');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  try {
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
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
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
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    // 1. Find user by email
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Compare passwords
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
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
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = {
  register,
  login
};