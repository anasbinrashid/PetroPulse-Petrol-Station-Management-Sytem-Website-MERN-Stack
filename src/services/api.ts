import { ApiResponse } from '../types/api';
import { toast } from 'sonner';

// Base API URL - use relative URL which works when frontend/backend are deployed together
const API_BASE_URL = '/api';

// Check if token exists in localStorage
const getToken = () => localStorage.getItem('token');

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  const data = await response.json();
  
  console.log(`[DEBUG][API] Response status: ${response.status}`);
  console.log(`[DEBUG][API] Response data:`, data);
  
  if (!response.ok) {
    return {
      success: false,
      error: data.message || "An error occurred",
      data: null
    };
  }
  
  return {
    success: true,
    data,
    error: null
  };
};

// Helper to fetch data with common options
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`[DEBUG][API] Fetching from: ${url}`);
    console.log(`[DEBUG][API] Request method: ${options.method || 'GET'}`);
    
    if (options.body) {
      console.log(`[DEBUG][API] Request body:`, options.body);
    }
    
    // Default headers
  const headers = {
    "Content-Type": "application/json",
      ...options.headers,
    };

    // Add authorization token if available
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`[DEBUG][API] Using token: ${token.substring(0, 15)}...`);
    } else {
      console.log(`[DEBUG][API] No token available`);
    }

    console.log(`[DEBUG][API] Request headers:`, headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

  return handleApiResponse(response);
};

// API functions for different resources
export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      console.log('[DEBUG][API] Attempting login with email:', email);
      return fetchApi('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      });
    },
    register: (userData: any) => fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    getProfile: () => fetchApi('/users/profile'),
    updateProfile: (userData: any) => fetchApi('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  },
  
  // Customer dashboard specific endpoints
  customer: {
    getProfile: () => fetchApi('/customer/profile'),
    updateProfile: (profileData: any) => fetchApi('/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
    getFuelPurchases: (startDate?: string, endDate?: string, page?: number, limit?: number) => {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (page) queryParams.append("page", page.toString());
      if (limit) queryParams.append("limit", limit.toString());
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/customer/fuel-purchases${queryString}`);
    },
    getLoyaltyTransactions: (page?: number, limit?: number) => {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append("page", page.toString());
      if (limit) queryParams.append("limit", limit.toString());
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/customer/loyalty${queryString}`);
    },
    getDashboardSummary: () => fetchApi('/customer/dashboard'),
    updatePassword: (currentPassword: string, newPassword: string) => fetchApi('/customer/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  },
  
  // Employee portal specific endpoints
  employee: {
    login: async (email: string, password: string) => {
      console.log('[DEBUG][API] Attempting employee login with email:', email);
      
      try {
        const response = await fetchApi('/employee/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        
        console.log('[DEBUG][API] Employee login response success:', response.success);
        console.log('[DEBUG][API] Employee login response structure:', Object.keys(response.data || {}));
        
        // Handle case where backend doesn't set userType
        if (response.success && response.data && !response.data.userType) {
          console.log('[DEBUG][API] Adding userType=employee to response data');
          response.data.userType = 'employee';
        }
        
        return response;
      } catch (error) {
        console.error('[DEBUG][API] Employee login error:', error);
        throw error;
      }
    },
    getProfile: () => {
      console.log('[DEBUG][API] Fetching employee profile');
      return fetchApi('/employee/profile');
    },
    updateProfile: (profileData: any) => fetchApi('/employee/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
    getSchedule: (startDate?: string, endDate?: string) => {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/employee/schedule${queryString}`);
    },
    getAttendance: (startDate?: string, endDate?: string, page?: number, limit?: number) => {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (page) queryParams.append("page", page.toString());
      if (limit) queryParams.append("limit", limit.toString());
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/employee/attendance${queryString}`);
    },
    getEnhancedAttendance: (startDate?: string, endDate?: string, page?: number, limit?: number) => {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (page) queryParams.append("page", page.toString());
      if (limit) queryParams.append("limit", limit.toString());
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/employee/attendance/enhanced${queryString}`);
    },
    getAttendanceMetrics: () => fetchApi('/employee/attendance/metrics'),
    reportAttendance: (data: any) => fetchApi('/employee/attendance/report', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    clockIn: (location?: string) => fetchApi('/employee/clock-in', {
      method: 'POST',
      body: JSON.stringify({ location }),
    }),
    clockOut: (location?: string) => fetchApi('/employee/clock-out', {
      method: 'POST',
      body: JSON.stringify({ location }),
    }),
    getPayroll: (year?: string) => fetchApi(`/employee/payroll${year ? `?year=${year}` : ''}`),
    updatePassword: (currentPassword: string, newPassword: string) => fetchApi('/employee/update-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  },
  
  // Fuel Inventory
  fuelInventory: {
    getAll: () => fetchApi('/fuel-inventory', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }),
    getById: (id: string) => fetchApi(`/fuel-inventory/${id}`),
    create: (data: any) => fetchApi('/fuel-inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchApi(`/fuel-inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi(`/fuel-inventory/${id}`, {
      method: 'DELETE',
    }),
    updateLevel: (id: string, data: { amount: number, operation: 'add' | 'set' | 'subtract' }) => 
      fetchApi(`/fuel-inventory/${id}/level`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
  },
  
  // Revenue
  revenue: {
    getAll: async (params?: { startDate?: string; endDate?: string; source?: string; category?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.source) queryParams.append("source", params.source);
      if (params?.category) queryParams.append("category", params.category);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/revenue${queryString}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      });
    },
    getById: async (id: string) => {
      return fetchApi(`/revenue/${id}`);
    },
    create: async (data: any) => {
      return fetchApi("/revenue", {
        method: "POST",
      body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return fetchApi(`/revenue/${id}`, {
        method: "PUT",
      body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return fetchApi(`/revenue/${id}`, {
        method: "DELETE",
      });
    },
    getSummary: (startDate?: string, endDate?: string) => {
      let queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/revenue/summary${queryString}`);
    },
  },
  
  // Products
  products: {
    getAll: async () => {
      return fetchApi("/products", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "If-Modified-Since": "0",
          "If-None-Match": ""
        }
      });
    },
    getById: async (id: string) => {
      return fetchApi(`/products/${id}`);
    },
    create: async (data: any) => {
      return fetchApi("/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return fetchApi(`/products/${id}`, {
        method: "PUT",
      body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return fetchApi(`/products/${id}`, {
        method: "DELETE",
      });
    },
    updateStock: async (id: string, data: { quantity: number; operation: 'add' | 'subtract' | 'set' }) => {
      return fetchApi(`/products/${id}/stock`, {
        method: "PATCH",
      body: JSON.stringify(data),
      });
    },
  },
  
  // Sales
  sales: {
    getAll: () => fetchApi('/sales'),
    getById: (id: string) => fetchApi(`/sales/${id}`),
    create: (data: any) => fetchApi('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchApi(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi(`/sales/${id}`, {
      method: 'DELETE',
    }),
    getReport: (startDate?: string, endDate?: string) => {
      let queryParams = '';
      if (startDate && endDate) {
        queryParams = `?startDate=${startDate}&endDate=${endDate}`;
      }
      return fetchApi(`/sales/report${queryParams}`);
    },
    getFuelPurchasesByCustomer: (customerId: string) => fetchApi(`/sales/fuel-purchases/${customerId}`),
  },
  
  // Employees
  employees: {
    getAll: async (params?: { department?: string; status?: string; search?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.department) queryParams.append("department", params.department);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.search) queryParams.append("search", params.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/admin/employees${queryString}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      });
    },
    getById: async (id: string) => {
      return fetchApi(`/admin/employees/${id}`);
    },
    create: async (data: any) => {
      return fetchApi("/admin/employees", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return fetchApi(`/admin/employees/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return fetchApi(`/admin/employees/${id}`, {
        method: "DELETE",
      });
    },
    updateStatus: async (id: string, status: string) => {
      return fetchApi(`/admin/employees/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    getAttendance: async (id: string, startDate?: string, endDate?: string) => {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/admin/employees/${id}/attendance${queryString}`);
    },
    addAttendance: async (id: string, data: any) => {
      return fetchApi(`/admin/employees/${id}/attendance`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    updateAttendance: async (id: string, attendanceId: string, data: any) => {
      return fetchApi(`/admin/employees/${id}/attendance/${attendanceId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },
  
  // Customers
  customers: {
    getAll: async (params?: { membershipLevel?: string; status?: string; customerType?: string; search?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.membershipLevel) queryParams.append("membershipLevel", params.membershipLevel);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.customerType) queryParams.append("customerType", params.customerType);
      if (params?.search) queryParams.append("search", params.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/admin/customers${queryString}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      });
    },
    getById: async (id: string) => {
      return fetchApi(`/admin/customers/${id}`);
    },
    create: async (data: any) => {
      return fetchApi("/admin/customers", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return fetchApi(`/admin/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return fetchApi(`/admin/customers/${id}`, {
        method: "DELETE",
      });
    },
    updateLoyaltyPoints: async (id: string, data: { points: number; operation: 'add' | 'subtract' | 'set' }) => {
      return fetchApi(`/admin/customers/${id}/loyalty`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
  },
  
  // Maintenance
  maintenance: {
    getAll: async (params?: { status?: string; priority?: string; category?: string; assignedTo?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.priority) queryParams.append("priority", params.priority);
      if (params?.category) queryParams.append("category", params.category);
      if (params?.assignedTo) queryParams.append("assignedTo", params.assignedTo);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/maintenance${queryString}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      });
    },
    getById: async (id: string) => {
      return fetchApi(`/maintenance/${id}`);
    },
    create: async (data: any) => {
      return fetchApi("/maintenance", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return fetchApi(`/maintenance/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return fetchApi(`/maintenance/${id}`, {
        method: "DELETE",
      });
    },
    updateStatus: async (id: string, status: string) => {
      return fetchApi(`/maintenance/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
  },
  
  // Expenses
  expenses: {
    getAll: async (params?: { startDate?: string; endDate?: string; category?: string; vendor?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.category) queryParams.append("category", params.category);
      if (params?.vendor) queryParams.append("vendor", params.vendor);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/expenses${queryString}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      });
    },
    getById: async (id: string) => {
      return fetchApi(`/expenses/${id}`);
    },
    create: async (data: any) => {
      return fetchApi("/expenses", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return fetchApi(`/expenses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return fetchApi(`/expenses/${id}`, {
        method: "DELETE",
      });
    },
    getSummary: async (startDate?: string, endDate?: string) => {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/expenses/summary${queryString}`);
    },
  },
  
  // Admin dashboard
  admin: {
    getDashboard: () => fetchApi('/admin/dashboard'),
    getProfile: () => fetchApi('/admin/profile'),
    getReports: () => fetchApi('/admin/reports'),
    getReport: (id: string) => fetchApi(`/admin/reports/${id}`),
    getInventory: () => fetchApi('/admin/inventory'),
    getSales: () => fetchApi('/admin/sales'),
    
    // These redirect to the specialized APIs
    getEmployees: () => api.employees.getAll(),
    getCustomers: () => api.customers.getAll(),
    getFinances: (startDate?: string, endDate?: string) => {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/admin/finances${queryString}`);
    },
    getMaintenance: () => api.maintenance.getAll(),
  },
  
  // Attendance
  attendance: {
    getAll: (params?: { status?: string; department?: string; startDate?: string; endDate?: string; page?: number; search?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.department) queryParams.append("department", params.department);
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.search) queryParams.append("search", params.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/attendance${queryString}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      });
    },
    getById: (id: string) => fetchApi(`/attendance/${id}`),
    create: (data: any) => fetchApi('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchApi(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi(`/attendance/${id}`, {
      method: 'DELETE',
    }),
    clockIn: () => fetchApi('/employees/clock-in', {
      method: 'POST',
    }),
    clockOut: () => fetchApi('/employees/clock-out', {
      method: 'POST',
    }),
    getMyAttendance: () => fetchApi('/employees/attendance'),
    getSummary: (startDate?: string, endDate?: string, department?: string) => {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (department) queryParams.append("department", department);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      return fetchApi(`/attendance/summary${queryString}`);
    },
  },
  
  // Reports
  reports: {
    getAll: () => fetchApi('/reports'),
    getById: (id: string) => fetchApi(`/reports/${id}`),
    create: (data: any) => fetchApi('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchApi(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchApi(`/reports/${id}`, {
      method: 'DELETE',
    }),
  }
};
