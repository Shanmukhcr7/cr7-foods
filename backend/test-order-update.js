const http = require('http');

const data = JSON.stringify({ status: 'preparing' });
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWZkMDM0M2VkMTA5NDMzYTJlY2E4NiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDU2MjA4MCwiZXhwIjoxNzYxMTY2ODgwfQ.zTGRSdHP7PrhekoOkMjF0vi7eeLCVIvxnS53MKsRUDQ';
const orderId = '68effdd32b50885930744078';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/admin/orders/${orderId}`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': data.length
  }
};

console.log('Sending PUT request to update order status...');
console.log('Order ID:', orderId);
console.log('New Status:', JSON.parse(data).status);

const req = http.request(options, (res) => {
  console.log(`Response Status: ${res.statusCode}`);
  console.log('Response Headers:', res.headers);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Response Body:', body);
    try {
      const response = JSON.parse(body);
      console.log('Parsed Response:', response);
    } catch (e) {
      console.log('Response is not JSON');
    }
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err.message);
});

req.write(data);
req.end();
