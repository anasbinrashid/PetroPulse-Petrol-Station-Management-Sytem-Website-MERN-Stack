const fetch = require('node-fetch');

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Sample maintenance task data
const sampleMaintenanceTask = {
  title: 'Test Maintenance Task',
  description: 'This is a test maintenance task created via API',
  priority: 'high',
  category: 'equipment',
  status: 'pending',
  location: 'Main Building',
  equipment: 'Fuel Pump #2',
  estimatedCost: 250,
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
};

// Admin login credentials
const adminCredentials = {
  email: 'admin@petropulse.com',
  password: 'password123'
};

// Helper function to test API endpoints
const testEndpoint = async (endpoint, method = 'GET', data = null, token = null) => {
  console.log(`\n🔍 Testing ${method} ${endpoint}`);
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('🟢 Success:');
      if (Array.isArray(responseData)) {
        console.log(`   Array with ${responseData.length} items`);
        if (responseData.length > 0) {
          console.log('   Sample item:');
          console.log(`   ID: ${responseData[0]._id}`);
          console.log(`   Title: ${responseData[0].title}`);
          console.log(`   Status: ${responseData[0].status}`);
        }
      } else {
        console.log('   Response data:');
        if (responseData._id) console.log(`   ID: ${responseData._id}`);
        if (responseData.title) console.log(`   Title: ${responseData.title}`);
        if (responseData.status) console.log(`   Status: ${responseData.status}`);
        if (responseData.message) console.log(`   Message: ${responseData.message}`);
      }
    } else {
      console.log('🔴 Error:');
      console.log(`   Message: ${responseData.message || 'Unknown error'}`);
      if (responseData.error) console.log(`   Details: ${responseData.error}`);
    }
    
    return { success: response.ok, data: responseData };
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Maintenance API Tests');
  console.time('Tests completed in');
  
  let createdTaskId;
  let authToken;
  
  // Login as admin to get token
  console.log('\n📝 Step 1: Login as admin to get token');
  const loginResult = await testEndpoint('/users/login', 'POST', adminCredentials);
  
  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    console.log('✅ Login successful, received authentication token');
    
    // Get all maintenance tasks
    console.log('\n📝 Step 2: Fetch all maintenance tasks');
    await testEndpoint('/maintenance', 'GET', null, authToken);
    
    // Create a new maintenance task
    console.log('\n📝 Step 3: Create a new maintenance task');
    const createResult = await testEndpoint('/maintenance', 'POST', sampleMaintenanceTask, authToken);
    
    if (createResult.success && createResult.data._id) {
      createdTaskId = createResult.data._id;
      console.log(`✅ Task created successfully with ID: ${createdTaskId}`);
      
      // Get the created task by ID
      console.log('\n📝 Step 4: Fetch the created task by ID');
      await testEndpoint(`/maintenance/${createdTaskId}`, 'GET', null, authToken);
      
      // Update the task
      console.log('\n📝 Step 5: Update the task');
      const updateData = {
        title: `${sampleMaintenanceTask.title} (Updated)`,
        description: `${sampleMaintenanceTask.description} - This task has been updated`,
        priority: 'medium'
      };
      await testEndpoint(`/maintenance/${createdTaskId}`, 'PUT', updateData, authToken);
      
      // Update the task status
      console.log('\n📝 Step 6: Update the task status');
      await testEndpoint(`/maintenance/${createdTaskId}/status`, 'PATCH', { status: 'in_progress' }, authToken);
      
      // Get all maintenance tasks with filters
      console.log('\n📝 Step 7: Fetch maintenance tasks with filters');
      await testEndpoint('/maintenance?status=in_progress&priority=medium', 'GET', null, authToken);
      
      // Delete the task
      console.log('\n📝 Step 8: Delete the task');
      await testEndpoint(`/maintenance/${createdTaskId}`, 'DELETE', null, authToken);
      
      // Verify deletion
      console.log('\n📝 Step 9: Verify task was deleted');
      await testEndpoint(`/maintenance/${createdTaskId}`, 'GET', null, authToken);
    } else {
      console.log('❌ Failed to create maintenance task, skipping remaining tests');
    }
  } else {
    console.log('❌ Login failed, cannot proceed with authenticated tests');
  }
  
  console.timeEnd('Tests completed in');
  console.log('\n🏁 Maintenance API Tests completed');
};

// Run the tests
runTests().catch(err => {
  console.error('❌ Test runner error:', err);
}); 