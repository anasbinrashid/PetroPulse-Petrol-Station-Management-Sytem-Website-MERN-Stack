const fetch = require('node-fetch');

/**
 * Test API endpoints to verify they're working properly
 */

// Base API URL
const BASE_URL = 'http://localhost:5000/api';

// Helper function to make API requests with logging
async function testEndpoint(endpoint, description) {
  console.log(`\n---- Testing: ${description} (${endpoint}) ----`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    const statusColor = response.ok ? '\x1b[32m' : '\x1b[31m'; // Green for success, red for error
    console.log(`${statusColor}Status: ${response.status} ${response.statusText}\x1b[0m`);
    
    if (response.ok) {
      if (Array.isArray(data)) {
        console.log(`Received ${data.length} items`);
        
        if (data.length > 0) {
          console.log('Sample data (first item):');
          console.log(JSON.stringify(data[0], null, 2).substring(0, 500) + (JSON.stringify(data[0], null, 2).length > 500 ? '...' : ''));
        }
      } else {
        const dataString = JSON.stringify(data, null, 2);
        console.log(`Data: ${dataString.substring(0, 500)}${dataString.length > 500 ? '...' : ''}`);
      }
      
      return { success: true, data };
    } else {
      console.log('Error response:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('\x1b[31mRequest failed:\x1b[0m', error.message);
    return { success: false, error: error.message };
  }
}

// Run all the tests
async function runTests() {
  console.log('===== STARTING API ENDPOINT TESTS =====');
  console.time('Testing completed in');
  
  // Test admin endpoints
  await testEndpoint('/admin/dashboard', 'Dashboard data');
  await testEndpoint('/admin/reports', 'All reports');
  await testEndpoint('/admin/finances', 'Financial data');
  await testEndpoint('/admin/maintenance', 'Maintenance tasks');
  await testEndpoint('/admin/employees', 'Employee list');
  await testEndpoint('/admin/customers', 'Customer list');
  await testEndpoint('/admin/inventory', 'Inventory data');
  await testEndpoint('/admin/sales', 'Sales data');
  
  // Test direct report endpoint
  await testEndpoint('/reports', 'Reports from direct endpoint');
  
  console.timeEnd('Testing completed in');
  console.log('===== API ENDPOINT TESTS COMPLETED =====');
}

// Run the tests
runTests().catch(err => {
  console.error('Error running tests:', err);
}); 