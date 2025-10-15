const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/users', require('./routes/user.routes')); // Public endpoint for users list (admin dashboard)
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/foods', require('./routes/food.routes'));
app.use('/api/orders', require('./routes/order.routes'));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CR7 Foods API',
    version: '1.0.0',
    endpoints: {
      user: '/api/user',
      admin: '/api/admin',
      foods: '/api/foods',
      orders: '/api/orders'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});

module.exports = app;
