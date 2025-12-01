import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const patterns: Record<HapticType, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30, 10, 30],
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error: [50, 100, 50],
};

export const useHaptic = () => {
  const trigger = useCallback((type: HapticType = 'light') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const selection = useCallback(() => trigger('light'), [trigger]);
  const impact = useCallback((style: 'light' | 'medium' | 'heavy' = 'medium') => trigger(style), [trigger]);
  const notification = useCallback((type: 'success' | 'warning' | 'error') => trigger(type), [trigger]);

  return { 
    trigger, 
    selection, 
    impact, 
    notification 
  };
};
