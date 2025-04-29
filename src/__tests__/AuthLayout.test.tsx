import { render, screen } from '@testing-library/react';
import { AuthLayout } from '../components/auth/AuthLayout';
import '@testing-library/jest-dom';

describe('AuthLayout Component', () => {
  const defaultProps = {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    children: <div data-testid="child-component">Child Content</div>
  };

  it('renders correctly with provided props', () => {
    render(<AuthLayout {...defaultProps} />);
    
    // Test title and subtitle are rendered
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    
    // Test logo is rendered
    const logo = screen.getByAltText('PetroPulse Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');
    expect(logo).toHaveClass('h-12');
    
    // Test children are rendered
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
  
  it('applies appropriate styling and layout', () => {
    render(<AuthLayout {...defaultProps} />);
    
    // Main container
    const container = screen.getByText('Test Title').closest('div[class*="flex h-screen"]');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('h-screen');
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('flex-col');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('justify-center');
    
    // Inner container
    const innerContainer = screen.getByText('Test Title').closest('div[class*="mx-auto"]');
    expect(innerContainer).toHaveClass('mx-auto');
    expect(innerContainer).toHaveClass('flex');
    expect(innerContainer).toHaveClass('w-full');
    expect(innerContainer).toHaveClass('flex-col');
    expect(innerContainer).toHaveClass('space-y-6');
    expect(innerContainer).toHaveClass('sm:w-[350px]');
    
    // Header section
    const header = screen.getByText('Test Title').closest('div[class*="flex flex-col space-y-2"]');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
    expect(header).toHaveClass('space-y-2');
    expect(header).toHaveClass('text-center');
    
    // Title
    const title = screen.getByText('Test Title');
    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveClass('font-semibold');
    
    // Subtitle
    const subtitle = screen.getByText('Test Subtitle');
    expect(subtitle).toHaveClass('text-sm');
    expect(subtitle).toHaveClass('text-muted-foreground');
  });
  
  it('renders different title and subtitle correctly', () => {
    render(
      <AuthLayout
        title="Another Title"
        subtitle="Another Subtitle"
        children={<div>Content</div>}
      />
    );
    
    expect(screen.getByText('Another Title')).toBeInTheDocument();
    expect(screen.getByText('Another Subtitle')).toBeInTheDocument();
  });
}); 