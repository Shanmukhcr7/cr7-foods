const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Admin = require('./models/admin.model');
const http = require('http');

async function testDashboard() {
  try {
    console.log('Testing admin dashboard API...\n');

    // Connect to database
    await mongoose.connect('mongodb+srv://23EG106B62:shanmukh123@cluster0.pelosap.mongodb.net/cr7foods');
    console.log('✅ Connected to MongoDB');

    // Get/create admin
    let admin = await Admin.findOne({ username: 'admin' });
    if (!admin) {
      admin = new Admin({
        username: 'admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
      });
      await admin.save();
      console.log('✅ Created admin');
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      'cr7secret',
      { expiresIn: '7d' }
    );
    console.log('✅ Generated admin token');

    // Get dashboard data
    const stats = await getDashboardData(token);
    console.log('\n📊 Dashboard Data:');
    console.log('- Total Orders:', stats.stats.totalOrders);
    console.log('- Total Revenue:', stats.stats.totalRevenue);
    console.log('- Total Users:', stats.stats.totalUsers);
    console.log('- Total Foods:', stats.stats.totalFoods);
    console.log('- Recent Orders:', stats.recentOrders.length);

    console.log('\n🎉 Admin dashboard is working perfectly!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Dashboard test failed:', error.message);
    process.exit(1);
  }
}

async function getDashboardData(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

testDashboard();
