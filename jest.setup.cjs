require('@testing-library/jest-dom');

// Mock Vite's import.meta.env
global.import = { 
  meta: { 
    env: {
      VITE_API_URL: 'http://localhost:3000',
      MODE: 'test',
      PROD: false,
      DEV: true,
      // Add any other environment variables your app uses
    } 
  } 
};

// Properly mock import.meta.env
Object.defineProperty(globalThis, 'import', {
  value: global.import,
  writable: true,
});

// Mock import.meta.env for components
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:3000',
      },
    },
  },
});

// Mock matchMedia if not available
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock IntersectionObserver for jsdom
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  constructor() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

// Polyfill for TextEncoder and TextDecoder
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock database connection
jest.mock('./backend/src/config/db', () => ({
  connectDB: jest.fn().mockImplementation(() => {
    console.log('[MOCK] Database connected');
  }),
}));

// Update mock for employeeDb to return a Promise with a then method
jest.mock('./backend/src/config/employeeDb', () => ({
  connectEmployeeDB: jest.fn().mockImplementation(() => {
    console.log('[MOCK] Employee database connected');
    return {
      then: jest.fn().mockImplementation(callback => {
        return callback({
          model: jest.fn(), // Mock the model method
        });
      }),
    };
  }),
}));

// Suppress Mongoose warnings
global.SUPPRESS_JEST_WARNINGS = true;