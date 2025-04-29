import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import '@testing-library/jest-dom';

// Define a simple schema for our test form
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

// Create a test component that uses the Form components
const TestForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  return (
    <Form {...form}>
      <form data-testid="test-form">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

describe('Form Components', () => {
  it('renders the complete form with all subcomponents', () => {
    render(<TestForm />);
    
    // Check that form rendered
    const form = screen.getByTestId('test-form');
    expect(form).toBeInTheDocument();
    
    // Check label
    const label = screen.getByText('Username');
    expect(label).toBeInTheDocument();
    
    // Check input
    const input = screen.getByPlaceholderText('Enter username');
    expect(input).toBeInTheDocument();
    
    // Check description
    const description = screen.getByText('This is your public display name.');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('text-muted-foreground');
  });
  
  it('applies appropriate styling to form components', () => {
    render(<TestForm />);
    
    // Test FormItem styling
    const username = screen.getByText('Username');
    const formItem = username.closest('div');
    expect(formItem).toHaveClass('space-y-2');
    
    // Test FormLabel styling
    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('for'); // Should have htmlFor attribute
    
    // Test FormDescription styling
    const description = screen.getByText('This is your public display name.');
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('text-muted-foreground');
  });
  
  // This test checks that the FormMessage component doesn't render when there's no error
  it('does not render FormMessage when there is no error', () => {
    render(<TestForm />);
    
    // FormMessage should not be in the document when there's no error
    const errorMessages = screen.queryAllByText(/username must be/i);
    expect(errorMessages.length).toBe(0);
  });
  
  // Note: Testing form validation errors would require simulating form submission
  // which is difficult to do directly in this test environment. That would be better
  // tested with integration tests using tools like Cypress or Playwright.
}); 