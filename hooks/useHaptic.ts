import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

const patterns: Record<HapticType, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30, 10, 30],
  success: [10, 50, 10],
  error: [30, 50, 30, 50, 30],
};

export const useHaptic = () => {
  const trigger = useCallback((type: HapticType = 'light') => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(patterns[type]);
      } catch (e) {
      }
    }
  }, []);

  const cancel = useCallback(() => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {
      }
    }
  }, []);

  return { trigger, cancel };
};
