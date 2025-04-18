
/**
 * Configuration for API endpoints and services
 */

// Base API URL - change based on environment
export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: 'http://localhost:5000/api',
  
  // API timeout in milliseconds
  TIMEOUT: 30000,
  
  // API endpoints
  ENDPOINTS: {
    FUEL_INVENTORY: '/fuel-inventory',
    PRODUCTS: '/products',
    REVENUE: '/revenue',
    SALES: '/sales',
    EMPLOYEES: '/employees',
  }
};

// Configure here based on environment
// In a production setup, you would use environment variables
export const getApiConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      ...API_CONFIG,
      // Use production API URL in real deployment
      BASE_URL: 'https://api.your-production-domain.com/api',
    };
  }
  
  return API_CONFIG;
};
