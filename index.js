import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path'; // Import path module to serve static files
import userRoutes from './routes/users.js';
import productRouter from './routes/Productroutes.js'; // Ensure the path and file name match
import Product from './models/Product.js'; // Import the Product model

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json()); // Replaces bodyParser.json()
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join( 'uploads')));



// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRouter);

// Database Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// POST route to create a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, imageUrl, category } = req.body;

    // Validate the data
    if (!name || !description || !price || !imageUrl || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new product
    const newProduct = new Product({ name, description, price, imageUrl, category });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
