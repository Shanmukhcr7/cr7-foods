const express = require('express');
const router = express.Router();
const Food = require('../models/food.model');
const { verifyAdmin } = require('../middleware/auth');
const { upload } = require('../utils/upload');

// @route   GET /api/foods
// @desc    Get all foods (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const foods = await Food.find(query).sort({ createdAt: -1 });
    
    res.json({ foods });
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/foods/:id
// @desc    Get single food by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    
    res.json({ food });
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/foods
// @desc    Add new food item
// @access  Private (Admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, category, available, imageUrl } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const foodData = {
      name,
      description,
      price: parseFloat(price),
      category,
      available: available === 'true' || available === true,
      imageUrl: imageUrl || ''
    };

    const food = new Food(foodData);
    await food.save();

    res.status(201).json({
      message: 'Food item added successfully',
      food
    });
  } catch (error) {
    console.error('Add food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/foods/:id
// @desc    Update food item
// @access  Private (Admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, description, price, category, available, imageUrl } = req.body;

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Update fields
    if (name) food.name = name;
    if (description) food.description = description;
    if (price) food.price = parseFloat(price);
    if (category) food.category = category;
    if (available !== undefined) {
      food.available = available === 'true' || available === true;
    }
    if (imageUrl !== undefined) {
      food.imageUrl = imageUrl;
    }

    await food.save();

    res.json({
      message: 'Food item updated successfully',
      food
    });
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/foods/:id
// @desc    Delete food item
// @access  Private (Admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/foods/categories/all
// @desc    Get all unique categories
// @access  Public
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Food.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
