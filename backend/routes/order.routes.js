const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const { verifyUser } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (User)
router.post('/', verifyUser, async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, phone, paymentMethod } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!deliveryAddress || !phone) {
      return res.status(400).json({ message: 'Delivery address and phone are required' });
    }

    // Create new order
    const order = new Order({
      userId: req.user._id,
      items,
      totalAmount,
      deliveryAddress,
      phone,
      paymentMethod: paymentMethod || 'COD',
      status: 'pending'
    });

    await order.save();

    // Populate food details
    await order.populate('items.foodId', 'name imageUrl');

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/user/:userId
// @desc    Get all orders for a specific user
// @access  Private (User)
router.get('/user/:userId', verifyUser, async (req, res) => {
  try {
    // Ensure user can only access their own orders
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orders = await Order.find({ userId: req.params.userId })
      .populate('items.foodId', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/user-orders
// @desc    Get all orders for current user
// @access  Private (User)
router.get('/user-orders', verifyUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.foodId', 'name imageUrl price')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private (User)
router.put('/:id/cancel', verifyUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure user can only cancel their own orders
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.foodId', 'name imageUrl price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
