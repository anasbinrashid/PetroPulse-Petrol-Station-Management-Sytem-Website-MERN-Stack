// Simple script to test API connectivity
async function testApiEndpoint() {
  const API_BASE_URL = 'https://petropulse-api.vercel.app';
  console.log(`Testing API at: ${API_BASE_URL}`);
  
  try {
    const response = await fetch(API_BASE_URL);
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Raw response:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
    
    return { status: response.status, text };
  } catch (error) {
    console.error('API Connection failed:', error);
    return null;
  }
}

testApiEndpoint(); 