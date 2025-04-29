import { render, screen } from '@testing-library/react';
import { AppLayout } from '../components/AppLayout';
import '@testing-library/jest-dom';

// Mock the dependencies
jest.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet-mock">Outlet Content</div>,
}));

jest.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header-mock">Header Content</div>,
}));

jest.mock('@/components/SidebarNav', () => ({
  SidebarNav: () => <div data-testid="sidebar-mock">Sidebar Content</div>,
}));

describe('AppLayout Component', () => {
  it('renders correctly with all subcomponents', () => {
    render(<AppLayout />);
    
    // Test the layout structure
    const container = screen.getByTestId('outlet-mock').parentElement?.parentElement?.parentElement;
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('overflow-hidden');
    
    // Test that the sidebar is rendered
    const sidebar = screen.getByTestId('sidebar-mock');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar.parentElement).toHaveClass('hidden');
    expect(sidebar.parentElement).toHaveClass('md:block');
    expect(sidebar.parentElement).toHaveClass('w-64');
    
    // Test that the header is rendered
    const header = screen.getByTestId('header-mock');
    expect(header).toBeInTheDocument();
    
    // Test that the outlet is rendered
    const outlet = screen.getByTestId('outlet-mock');
    expect(outlet).toBeInTheDocument();
    expect(outlet.parentElement).toHaveClass('flex-1');
    expect(outlet.parentElement).toHaveClass('overflow-auto');
    expect(outlet.parentElement).toHaveClass('p-6');
  });
  
  it('renders the main content area correctly', () => {
    render(<AppLayout />);
    
    // Get the main element that contains the header and outlet
    const main = screen.getByTestId('header-mock').parentElement;
    expect(main).toHaveClass('flex');
    expect(main).toHaveClass('w-full');
    expect(main).toHaveClass('flex-col');
  });
}); 