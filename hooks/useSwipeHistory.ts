import { useState, useCallback } from 'react';
import { Profile } from '../types';

interface SwipeHistoryItem {
  profile: Profile;
  action: 'like' | 'reject' | 'super';
  timestamp: number;
}

interface UseSwipeHistoryOptions {
  maxHistory?: number;
}

export const useSwipeHistory = ({ maxHistory = 10 }: UseSwipeHistoryOptions = {}) => {
  const [history, setHistory] = useState<SwipeHistoryItem[]>([]);

  const addToHistory = useCallback((profile: Profile, action: 'like' | 'reject' | 'super') => {
    setHistory(prev => {
      const newHistory = [...prev, { profile, action, timestamp: Date.now() }];
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

  const getLastAction = useCallback((): SwipeHistoryItem | null => {
    return history.length > 0 ? history[history.length - 1] : null;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getStats = useCallback(() => {
    const likes = history.filter(h => h.action === 'like').length;
    const rejects = history.filter(h => h.action === 'reject').length;
    const superLikes = history.filter(h => h.action === 'super').length;
    
    return { likes, rejects, superLikes, total: history.length };
  }, [history]);

  return {
    history,
    addToHistory,
    undo,
    canUndo,
    getLastAction,
    clearHistory,
    getStats,
  };
};
