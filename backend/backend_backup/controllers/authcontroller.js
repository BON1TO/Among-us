const User = require('../models/user');  // fix: capital U for User model
const jwt = require('jsonwebtoken');

// Helper: Generate JWT token with branch info too (optional)
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, branch: user.branch },  // added branch
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// New function to check if email is registered
exports.checkEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // Check if user with this email exists
    const user = await User.findOne({ email: email.toLowerCase() });

    // Respond with JSON whether user exists or not
    return res.status(200).json({ registered: !!user });
  } catch (error) {
    console.error('Error checking email:', error);
    return res.status(500).json({ error: 'Server error checking email.' });
  }
};


//registeration
exports.register = async (req, res) => {
  const { name, email, password, branch } = req.body;  // accept branch

  // Check for Thapar domain
  if (!email.endsWith('@thapar.edu')) {
    return res.status(400).json({ error: 'Only @thapar.edu emails are allowed.' });
  }

  // Validate branch is one of allowed branches
  const allowedBranches = ['computer science', 'electronic', 'mechanical', 'civil', 'electrical'];
  if (!branch || !allowedBranches.includes(branch.toLowerCase())) {
    return res.status(400).json({ error: `Branch must be one of: ${allowedBranches.join(', ')}` });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Create and save user
    const user = await User.create({ name, email, password, branch: branch.toLowerCase() });
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registered successfully!',
      token,
      user: { id: user._id, name: user.name, email: user.email, branch: user.branch }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};


// LOGIN user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = generateToken(user);
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email, branch: user.branch }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
};
