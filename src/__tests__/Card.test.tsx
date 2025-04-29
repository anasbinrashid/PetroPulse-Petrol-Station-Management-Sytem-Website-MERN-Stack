import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import '@testing-library/jest-dom';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders correctly with default props', () => {
      render(<Card data-testid="card">Card Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveTextContent('Card Content');
    });

    it('applies additional className when provided', () => {
      render(<Card data-testid="card" className="test-class">Card Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('test-class');
    });
  });

  describe('CardHeader', () => {
    it('renders correctly with default props', () => {
      render(<CardHeader data-testid="card-header">Header Content</CardHeader>);
      const header = screen.getByTestId('card-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('p-6');
      expect(header).toHaveTextContent('Header Content');
    });

    it('applies additional className when provided', () => {
      render(<CardHeader data-testid="card-header" className="test-class">Header Content</CardHeader>);
      const header = screen.getByTestId('card-header');
      expect(header).toHaveClass('test-class');
    });
  });

  describe('CardTitle', () => {
    it('renders correctly with default props', () => {
      render(<CardTitle data-testid="card-title">Title Content</CardTitle>);
      const title = screen.getByTestId('card-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('text-2xl');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveTextContent('Title Content');
    });

    it('applies additional className when provided', () => {
      render(<CardTitle data-testid="card-title" className="test-class">Title Content</CardTitle>);
      const title = screen.getByTestId('card-title');
      expect(title).toHaveClass('test-class');
    });
  });

  describe('CardDescription', () => {
    it('renders correctly with default props', () => {
      render(<CardDescription data-testid="card-description">Description Content</CardDescription>);
      const description = screen.getByTestId('card-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-muted-foreground');
      expect(description).toHaveTextContent('Description Content');
    });

    it('applies additional className when provided', () => {
      render(<CardDescription data-testid="card-description" className="test-class">Description Content</CardDescription>);
      const description = screen.getByTestId('card-description');
      expect(description).toHaveClass('test-class');
    });
  });

  describe('CardContent', () => {
    it('renders correctly with default props', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>);
      const content = screen.getByTestId('card-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('p-6');
      expect(content).toHaveClass('pt-0');
      expect(content).toHaveTextContent('Content');
    });

    it('applies additional className when provided', () => {
      render(<CardContent data-testid="card-content" className="test-class">Content</CardContent>);
      const content = screen.getByTestId('card-content');
      expect(content).toHaveClass('test-class');
    });
  });

  describe('CardFooter', () => {
    it('renders correctly with default props', () => {
      render(<CardFooter data-testid="card-footer">Footer Content</CardFooter>);
      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('p-6');
      expect(footer).toHaveClass('pt-0');
      expect(footer).toHaveTextContent('Footer Content');
    });

    it('applies additional className when provided', () => {
      render(<CardFooter data-testid="card-footer" className="test-class">Footer Content</CardFooter>);
      const footer = screen.getByTestId('card-footer');
      expect(footer).toHaveClass('test-class');
    });
  });

  it('renders a complete card with all subcomponents', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );

    const card = screen.getByTestId('full-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card Title');
    expect(card).toHaveTextContent('Card Description');
    expect(card).toHaveTextContent('Card Content');
    expect(card).toHaveTextContent('Card Footer');
  });
}); 