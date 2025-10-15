const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Admin = require('./models/admin.model');

// Create a test admin token
async function createTestToken() {
  try {
    console.log('Creating test admin token...');

    // Find or create test admin
    let admin = await Admin.findOne({ username: 'admin' });

    if (!admin) {
      console.log('Creating admin user...');
      admin = new Admin({
        username: 'admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' //admin123
      });
      await admin.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET || 'cr7secret',
      { expiresIn: '7d' }
    );

    console.log('Test admin token created:', token);
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    return null;
  }
}

// Test the admin orders endpoint
async function testAdminOrders(token) {
  console.log('\nTesting admin orders endpoint...');

  const testToken = token || await createTestToken();
  if (!testToken) {
    console.error('Failed to create token');
    return;
  }

  console.log('Using token:', testToken.substring(0, 50) + '...');

  // Test the API route
  const express = require('express');
  const app = express();

  // Configure middleware
  app.use(express.json());
  const cors = require('cors');
  app.use(cors());

  // Add routes manually for testing
  const Order = require('./models/order.model');
  const { verifyAdmin } = require('./middleware/auth');

  app.get('/api/admin/orders', verifyAdmin, async (req, res) => {
    try {
      console.log('Route hit! Admin:', req.admin);
      const { status } = req.query;

      let query = {};
      if (status) {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate('userId', 'name email phone')
        .populate('items.foodId', 'name')
        .sort({ createdAt: -1 });

      console.log('Found orders:', orders.length);
      res.json({ orders });
    } catch (error) {
      console.error('Error in route:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Start test server on different port
  const testServer = app.listen(3001, () => {
    console.log('Test server running on port 3001');

    // Make request to our own test server
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/admin/orders',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Response:', data);
        testServer.close();

        // Check if orders found
        try {
          const response = JSON.parse(data);
          if (response.orders && response.orders.length > 0) {
            console.log('✅ Orders found:', response.orders.length);
            response.orders.forEach(order => {
              console.log('  - Order ID:', order._id, 'Status:', order.status);
            });
          } else {
            console.log('❌ No orders found in response');
          }
        } catch (e) {
          console.log('❌ Invalid JSON response');
        }

        process.exit(0);
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err);
      testServer.close();
      process.exit(1);
    });

    req.end();
  });
}

// Main function
async function main() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://23EG106B62:shanmukh123@cluster0.pelosap.mongodb.net/cr7foods');

    console.log('✅ Connected to MongoDB');

    // Check orders in database
    const Order = require('./models/order.model');
    const orders = await Order.find({}).sort({createdAt: -1});
    console.log('📊 Orders in database:', orders.length);

    if (orders.length > 0) {
      console.log('Orders:');
      orders.forEach(order => {
        console.log('  -', order._id, 'Status:', order.status, 'Total:', order.totalAmount);
      });
    } else {
      console.log('❌ No orders in database');
    }

    await testAdminOrders();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
