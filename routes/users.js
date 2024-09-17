// users.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '/home/sivananthi/Documents/UKI FINAL PROJECT/backend/models/User.js';  // Adjust the path as needed

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; 

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if the email or username already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Ensure the default role is 'user'
    const user = new User({ username, email, password: hashedPassword, role: 'user' });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error); // Log the full error for debugging
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email); // Log for debugging
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email); // Log for debugging
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    // Send token and role in response
    res.json({ token, role: user.role });
    
  } catch (error) {
    console.error('Error during login:', error); // Log the full error for debugging
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});




// Promote User to Admin Route
router.post('/promote', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { username: username }, // Find the user by username
      { $set: { role: 'admin' } }, // Set the role to 'admin'
      { new: true } // Return the updated document
    );

    if (user) {
      res.status(200).json({ message: `User ${username} is now an admin.` });
    } else {
      res.status(404).json({ message: `User ${username} not found.` });
    }
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    res.status(500).json({ message: 'Error promoting user to admin', error: error.message });
  }
});

export default router;  // Use `export default` for ES module syntax
