import { cn } from '../lib/utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes correctly', () => {
      const condition = true;
      expect(cn('class1', condition && 'class2', !condition && 'class3')).toBe('class1 class2');
      
      const anotherCondition = false;
      expect(cn('class1', anotherCondition && 'class2', !anotherCondition && 'class3')).toBe('class1 class3');
    });

    it('handles objects correctly', () => {
      expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
    });

    it('handles arrays correctly', () => {
      expect(cn('class1', ['class2', 'class3'])).toBe('class1 class2 class3');
    });

    it('handles undefined values correctly', () => {
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
    });

    it('handles null values correctly', () => {
      expect(cn('class1', null, 'class2')).toBe('class1 class2');
    });

    it('handles empty strings correctly', () => {
      expect(cn('class1', '', 'class2')).toBe('class1 class2');
    });

    it('handles tailwind conflicts correctly using twMerge', () => {
      expect(cn('p-4 m-2', 'p-6')).toBe('m-2 p-6');
    });
  });
}); 