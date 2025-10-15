const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Pizza', 'Burger', 'Pasta', 'Salad', 'pizza', 'burger', 'pasta', 'dessert', 'drink']
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300'
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Food', foodSchema);
