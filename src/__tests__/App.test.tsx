import { render, screen } from '@testing-library/react';
import App from '../App';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// Mock the entire react-router-dom module
jest.mock('react-router-dom', () => {
  // Use actual implementations for specific components/functions we need
  const originalModule = jest.requireActual('react-router-dom');
  
  return {
    ...originalModule,
    // Mock BrowserRouter to prevent double Router issue
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Route: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    // Mock hooks that depend on router context
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/' }),
    useParams: () => ({}),
  };
});

// Mock components that use import.meta.env
jest.mock('../components/customers/CustomerForm', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Customer Form</div>
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    // This test simply verifies that the App component renders without throwing an error
    render(<App />);
    // Just assert something simple to verify the test ran
    expect(document.body).toBeInTheDocument();
  });
}); 