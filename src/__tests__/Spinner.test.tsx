import { render, screen } from '@testing-library/react';
import { Spinner } from '../components/ui/spinner';
import '@testing-library/jest-dom';

describe('Spinner Component', () => {
  it('renders with default size (md)', () => {
    render(<Spinner />);
    const spinnerElement = document.querySelector('.animate-spin') as HTMLElement;
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveClass('h-6 w-6');
  });

  it('renders with small size', () => {
    render(<Spinner size="sm" />);
    const spinnerElement = document.querySelector('.animate-spin') as HTMLElement;
    expect(spinnerElement).toHaveClass('h-4 w-4');
  });

  it('renders with large size', () => {
    render(<Spinner size="lg" />);
    const spinnerElement = document.querySelector('.animate-spin') as HTMLElement;
    expect(spinnerElement).toHaveClass('h-8 w-8');
  });

  it('applies custom className', () => {
    render(<Spinner className="text-red-500" />);
    const spinnerElement = document.querySelector('.animate-spin') as HTMLElement;
    expect(spinnerElement).toHaveClass('text-red-500');
  });
}); 