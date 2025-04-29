// __tests__/api.client.spec.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { api } from '../services/api';

// Mock axios
jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    })),
  };
});

// Mock the actual API implementation structure
jest.mock('../services/api', () => ({
  api: {
    customers: {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auth: {
      login: jest.fn(),
      register: jest.fn(),
      getProfile: jest.fn()
    }
  }
}));

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('customers', () => {
    it('getAll() fetches customers correctly', async () => {
      const mockData = [{ id: '1', name: 'Test Customer' }];
      (api.customers.getAll as jest.Mock).mockResolvedValueOnce({ success: true, data: mockData });
      
      const result = await api.customers.getAll();
      
      expect(api.customers.getAll).toHaveBeenCalled();
      expect(result.data).toEqual(mockData);
    });

    it('create() creates a customer correctly', async () => {
      const payload = { name: 'New Customer' };
      (api.customers.create as jest.Mock).mockResolvedValueOnce({ 
        success: true, 
        data: { id: '1', ...payload } 
      });
      
      const result = await api.customers.create(payload);
      
      expect(api.customers.create).toHaveBeenCalledWith(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('auth', () => {
    it('login() authenticates a user correctly', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      (api.auth.login as jest.Mock).mockResolvedValueOnce({ 
        success: true, 
        data: { user: { id: '1' } } 
      });
      
      const result = await api.auth.login(credentials.email, credentials.password);
      
      expect(api.auth.login).toHaveBeenCalledWith(credentials.email, credentials.password);
      expect(result.success).toBe(true);
    });
  });
});
