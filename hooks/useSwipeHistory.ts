import { useState, useCallback } from 'react';
import { Profile } from '../types';

interface SwipeHistoryItem {
  profile: Profile;
  action: 'like' | 'reject' | 'super';
  timestamp: Date;
}

interface UseSwipeHistoryOptions {
  maxHistory?: number;
}

export const useSwipeHistory = ({ maxHistory = 10 }: UseSwipeHistoryOptions = {}) => {
  const [history, setHistory] = useState<SwipeHistoryItem[]>([]);

  const addToHistory = useCallback((profile: Profile, action: 'like' | 'reject' | 'super') => {
    setHistory(prev => {
      const newHistory = [...prev, { profile, action, timestamp: new Date() }];
      return newHistory.slice(-maxHistory);
    });
  }, [maxHistory]);

  const undo = useCallback((): SwipeHistoryItem | null => {
    if (history.length === 0) return null;
    
    const lastItem = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    return lastItem;
  }, [history]);

  const canUndo = history.length > 0;
  
  const lastSwipe = history.length > 0 ? history[history.length - 1] : null;

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getHistoryByAction = useCallback((action: 'like' | 'reject' | 'super') => {
    return history.filter(item => item.action === action);
  }, [history]);

  return {
    history,
    addToHistory,
    undo,
    canUndo,
    lastSwipe,
    clearHistory,
    getHistoryByAction,
    likeCount: getHistoryByAction('like').length,
    rejectCount: getHistoryByAction('reject').length,
    superCount: getHistoryByAction('super').length,
  };
};
