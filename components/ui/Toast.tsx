import React, { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  message, 
  duration = 3000, 
  onClose 
}) => {
  const { isDarkMode } = useTheme();
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  }, [id, onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-action-green" />;
      case 'error':
        return <AlertCircle size={20} className="text-action-red" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'info':
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-action-green/30';
      case 'error':
        return 'border-action-red/30';
      case 'warning':
        return 'border-yellow-500/30';
      case 'info':
        return 'border-blue-500/30';
    }
  };

  return (
    <div 
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border
        ${isDarkMode ? 'bg-surface/95 text-white' : 'bg-white/95 text-gray-900'}
        ${getBorderColor()}
        ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
      `}
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button 
        onClick={handleClose}
        className={`p-1 rounded-full transition-colors ${
          isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
        }`}
      >
        <X size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; type: ToastType; message: string; duration?: number }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-28 left-4 right-4 z-[1000] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto w-full max-w-sm">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};
