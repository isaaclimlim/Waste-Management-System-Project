const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id.toString(),
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: '30d',
    }
  );
};

exports.register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      console.log('Missing required fields:', { name, email, password, phone, role });
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'email', 'password', 'phone', 'role']
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      phone,
      role,
      location: {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates
      }
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['email', 'password']
      });
    }

    // Find user
    const user = await User.findOne({ email });
    console.log('User found:', user ? {
      id: user._id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    } : 'No user found');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    console.log('Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}; 