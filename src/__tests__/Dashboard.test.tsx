// src/__tests__/Dashboard.test.tsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1️⃣ Mock relevant API endpoints before importing Dashboard
jest.mock('../services/api', () => {
  const actual = jest.requireActual('../services/api');
  return {
    ...actual,
    api: {
      ...actual.api,
      admin: { getDashboard: jest.fn() },
      sales: { getAll: jest.fn() },
      fuelInventory: { getAll: jest.fn() },
    },
  };
});

// 2️⃣ Import the mocked api and component under test
import { api } from '../services/api';
import Dashboard from '../pages/Dashboard';

// 3️⃣ Stub child dashboard components
jest.mock('../components/dashboard/StatCard', () => ({
  StatCard: ({ title, value }: { title: string; value: string }) => (
    <div data-testid="stat-card">
      <div data-testid="title">{title}</div>
      <div data-testid="value">{value}</div>
    </div>
  ),
}));
jest.mock('../components/dashboard/RevenueChart', () => ({ RevenueChart: () => <div data-testid="revenue-chart" /> }));
jest.mock('../components/dashboard/FuelLevelChart', () => ({ FuelLevelChart: () => <div data-testid="fuel-level-chart" /> }));
jest.mock('../components/dashboard/TopSellingProducts', () => ({ TopSellingProducts: () => <div data-testid="top-selling-products" /> }));
jest.mock('../components/dashboard/RecentTransactions', () => ({ RecentTransactions: () => <div data-testid="recent-transactions" /> }));

describe('Dashboard Page', () => {
  const mockGetDashboard = api.admin.getDashboard as jest.Mock;
  const mockGetSales = api.sales.getAll as jest.Mock;
  const mockGetInventory = api.fuelInventory.getAll as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Dashboard stats data
    mockGetDashboard.mockResolvedValue({
      success: true,
      data: {
        stats: [
          { title: 'Total Revenue', value: '$10,000' },
          { title: 'Fuel Sales', value: '500 gallons' },
          { title: 'Transactions', value: '120' },
          { title: 'Customers', value: '75' },
        ],
        recentTransactions: [],
        fuelLevels: [],
      },
    });
    // Sales and inventory lists
    mockGetSales.mockResolvedValue({ success: true, data: [] });
    mockGetInventory.mockResolvedValue({ success: true, data: [] });
  });

  it('calls all necessary APIs on mount', async () => {
    await act(async () => { render(<Dashboard />); });
    expect(mockGetDashboard).toHaveBeenCalled();
    expect(mockGetSales).toHaveBeenCalled();
    expect(mockGetInventory).toHaveBeenCalled();
  });

  it('renders loading skeletons initially', () => {
    // hang the dashboard call to simulate loading
    mockGetDashboard.mockReturnValue(new Promise(() => {}));
    const { container } = render(<Dashboard />);
    const skeletons = container.getElementsByClassName('animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders dashboard title', async () => {
    await act(async () => { render(<Dashboard />); });
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});