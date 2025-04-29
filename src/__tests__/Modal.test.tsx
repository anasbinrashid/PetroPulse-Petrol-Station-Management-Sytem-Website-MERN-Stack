import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../components/ui/Modal';
import '@testing-library/jest-dom';

// Mock ReactDOM.createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should not render content when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div data-testid="modal-content">Modal Content</div>
      </Modal>
    );
    
    const modalContent = screen.queryByTestId('modal-content');
    expect(modalContent).not.toBeInTheDocument();
  });

  it('should render content when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div data-testid="modal-content">Modal Content</div>
      </Modal>
    );
    
    const modalContent = screen.getByTestId('modal-content');
    expect(modalContent).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Find the close button (the one with the × character)
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
}); 