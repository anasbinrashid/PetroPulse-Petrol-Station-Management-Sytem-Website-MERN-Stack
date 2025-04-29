import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../components/ui/input';
import '@testing-library/jest-dom';

describe('Input Component', () => {
  it('renders correctly with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('rounded-md');
    expect(input).toHaveClass('border-input');
  });

  it('renders with specified type', () => {
    render(<Input type="password" placeholder="Enter password" />);
    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('applies additional className when provided', () => {
    render(<Input className="test-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('test-class');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('updates value on change', async () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    await userEvent.type(input, 'Hello');
    expect(handleChange).toHaveBeenCalledTimes(5); // Once for each character
    
    expect(input).toHaveValue('Hello');
  });

  it('passes additional props to the input element', () => {
    render(
      <Input 
        data-testid="test-input"
        placeholder="Test placeholder"
        aria-label="Test label"
        maxLength={10}
      />
    );
    
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('placeholder', 'Test placeholder');
    expect(input).toHaveAttribute('aria-label', 'Test label');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('correctly forwards ref to the underlying input element', () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);
    
    // Check that ref was called with an HTMLInputElement
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });
}); 