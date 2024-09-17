import express from 'express';
import multer from 'multer'; // Use ES module import for multer
import path from 'path';
import Product from '../models/Product.js'; // Adjust the import path as needed

const productRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists at the root level
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append current timestamp to avoid name collisions
  },
});

const upload = multer({ storage });

// Endpoint to create a new product with image upload
productRouter.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !description || !price || !category || !quantity || !imageUrl) {
      return res.status(400).json({ message: 'All fields are required, including image' });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      quantity,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error uploading product:', error);
    res.status(500).json({ message: 'Failed to upload product' });
  }
});

// Update a product with image upload and quantity
productRouter.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Dynamically update product fields
    const fieldsToUpdate = ['name', 'description', 'price', 'category', 'quantity'];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field]) {
        product[field] = req.body[field];
      }
    });

    // Update image if provided
    product.imageUrl = req.file ? `/uploads/${req.file.filename}` : product.imageUrl;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error });
  }
});

// Get products by category
productRouter.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error); // Enhanced error logging
    res.status(500).json({ message: 'Error fetching products by category' });
  }
});

// Get all products
productRouter.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single product by ID
productRouter.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a product by ID
productRouter.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error });
  }
});


export default productRouter;

