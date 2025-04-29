import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../hooks/use-mobile';

describe('useIsMobile hook', () => {
  // Save the original implementation
  const originalMatchMedia = window.matchMedia;
  const originalInnerWidth = window.innerWidth;
  
  // Setup mocks
  beforeEach(() => {
    // Create a mock implementation of matchMedia
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: window.innerWidth < 768,
        media: query,
        onchange: null,
        addEventListener: jest.fn((event, handler) => {
          // Store the handler for later use
          window.matchMedia('').onchange = handler;
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    });
  });
  
  // Restore original implementation
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth,
    });
  });
  
  it('should return false for desktop view', () => {
    // Set innerWidth to desktop size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });
  
  it('should return true for mobile view', () => {
    // Set innerWidth to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 500,
    });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });
  
  it('should update when window size changes', () => {
    // Mock the addEventListener to capture the onChange handler
    const changeHandlers = new Map();
    window.matchMedia = jest.fn().mockImplementation((query) => {
      const mql = {
        matches: window.innerWidth < 768,
        media: query,
        onchange: null,
        addEventListener: jest.fn((event, handler) => {
          changeHandlers.set(event, handler);
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
      return mql;
    });
    
    // Start with desktop
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    
    // Change to mobile and trigger handler
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
      const handler = changeHandlers.get('change');
      if (handler) {
        handler({ matches: true } as MediaQueryListEvent);
      }
    });
    
    expect(result.current).toBe(true);
  });
  
  it('should clean up event listener on unmount', () => {
    const removeEventListenerMock = jest.fn();
    
    // Create a new mock with specific implementation for this test
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: removeEventListenerMock,
        dispatchEvent: jest.fn(),
      };
    });
    
    const { unmount } = renderHook(() => useIsMobile());
    
    unmount();
    
    // Verify that removeEventListener was called
    expect(removeEventListenerMock).toHaveBeenCalled();
  });
}); 