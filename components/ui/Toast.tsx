import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-action-green/20 border-action-green/30 text-action-green',
  error: 'bg-action-red/20 border-action-red/30 text-action-red',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500',
  info: 'bg-action-purple/20 border-action-purple/30 text-action-purple',
};

export const Toast: React.FC<ToastProps> = ({ 
  id, 
  message, 
  type = 'info', 
  duration = 3000,
  onClose 
}) => {
  const { isDarkMode } = useTheme();
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div 
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-lg
        ${isDarkMode ? 'bg-surface/90' : 'bg-white/90'}
        ${colors[type]}
        ${isExiting ? 'animate-in fade-out slide-out-to-right duration-300' : 'animate-in fade-in slide-in-from-right duration-300'}
      `}
    >
      <Icon size={20} className="shrink-0" />
      <p className={`text-sm font-medium flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {message}
      </p>
      <button 
        onClick={handleClose}
        className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
      >
        <X size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type?: ToastType }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={onClose}
        />
      ))}
    </div>
  );
};
