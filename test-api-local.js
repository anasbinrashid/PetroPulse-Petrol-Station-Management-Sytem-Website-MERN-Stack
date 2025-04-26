// Test script for checking API connectivity
// This assumes the app is running locally

// Define a base URL for testing
const BASE_URL = 'http://localhost:8080'; // This is your frontend URL

async function testApiEndpoint() {
  const API_PATH = '/api/users/login';
  const fullUrl = `${BASE_URL}${API_PATH}`;
  
  console.log(`Testing API at: ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@petropulse.com',
        password: 'admin123'
      })
    });
    
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log('API Response JSON:', data);
        console.log('Authentication successful!');
      } catch (e) {
        const text = await response.text();
        console.log('Raw response:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
      }
    } else {
      const text = await response.text();
      console.log('Raw error response:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
    }
  } catch (error) {
    console.error('API Connection failed:', error.message);
  }
}

// Call the test function
testApiEndpoint(); 