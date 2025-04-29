import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import '@testing-library/jest-dom';

// Mock the Portal component from Radix since it uses createPortal which is not available in test environment
jest.mock('@radix-ui/react-select', () => {
  const ActualModule = jest.requireActual('@radix-ui/react-select');
  return {
    ...ActualModule,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('Select Component', () => {
  it('renders select with trigger and value', async () => {
    render(
      <Select defaultValue="apple">
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass('rounded-md');
    expect(trigger).toHaveClass('border-input');
    expect(trigger).toHaveTextContent('Apple');
  });

  it('applies additional className to trigger', () => {
    render(
      <Select>
        <SelectTrigger className="test-class" data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveClass('test-class');
  });

  it('shows placeholder when no value is selected', () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveTextContent('Select a fruit');
  });

  it('can be disabled', () => {
    render(
      <Select disabled>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toBeDisabled();
  });
  
  // Testing SelectItem properties by inspecting the rendered option element
  it('renders SelectItem correctly with default props', () => {
    render(
      <Select defaultOpen={true}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="test">Test Item</SelectItem>
        </SelectContent>
      </Select>
    );
    
    // Look for the content in the Portal
    const itemText = screen.getByText('Test Item');
    expect(itemText).toBeInTheDocument();
    
    // Find the parent item element
    const item = itemText.closest('div[role="option"]');
    expect(item).toHaveClass('cursor-default');
    expect(item).toHaveClass('select-none');
  });
  
  it('applies additional className to SelectItem', () => {
    render(
      <Select defaultOpen={true}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="test" className="test-class">Test Item</SelectItem>
        </SelectContent>
      </Select>
    );
    
    const itemText = screen.getByText('Test Item');
    const item = itemText.closest('div[role="option"]');
    expect(item).toHaveClass('test-class');
  });
  
  it('can disable SelectItem', () => {
    render(
      <Select defaultOpen={true}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="test" disabled>Test Item</SelectItem>
        </SelectContent>
      </Select>
    );
    
    const itemText = screen.getByText('Test Item');
    const item = itemText.closest('div[role="option"]');
    
    // Just check if the attribute exists, regardless of its value
    expect(item).toHaveAttribute('data-disabled');
  });
}); 