// src/__tests__/use-toast.test.ts
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../hooks/use-toast';

beforeAll(() => {
  // 1️⃣ Enable fake timers for all of these tests
  jest.useFakeTimers();
});

afterAll(() => {
  // 2️⃣ Restore real timers once we’re done
  jest.useRealTimers();
});

describe('useToast hook', () => {
  it('should add toast to state', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test',
      });
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    expect(result.current.toasts[0].description).toBe('This is a test');
  });

  it('should remove toast from state when dismissed', () => {
    const { result } = renderHook(() => useToast());
    let toastId: string;

    act(() => {
      const toast = result.current.toast({
        title: 'Test Toast',
      });
      toastId = toast.id;
    });

    expect(result.current.toasts.length).toBe(1);

    act(() => {
      result.current.dismiss(toastId);
      // advance all pending timers so the removal callback runs
      jest.runAllTimers();
    });

    expect(result.current.toasts.filter(t => t.id === toastId)).toHaveLength(0);
  });

  it('should update toast content', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      const toast1 = result.current.toast({
        title: 'Original Toast',
      });
      result.current.dismiss(toast1.id);
      // we don’t need to flush timers here if update happens immediately
      result.current.toast({
        title: 'Updated Toast',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Updated Toast');
  });
});
