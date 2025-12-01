import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-full flex items-center justify-center flex-col gap-6 p-8 bg-background">
          <div className="relative">
            <div className="w-20 h-20 bg-action-red/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-action-red" size={40} />
            </div>
            <div className="absolute inset-0 rounded-full border border-action-red/20 animate-ping" />
          </div>
          
          <div className="text-center">
            <h2 className="text-white font-bold text-xl mb-2">
              Oops, quelque chose s'est mal passé
            </h2>
            <p className="text-gray-500 text-sm max-w-[280px] leading-relaxed">
              Une erreur inattendue s'est produite. Veuillez réessayer ou recharger la page.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="w-full max-w-sm p-4 bg-surface rounded-2xl border border-white/5">
              <p className="text-xs text-action-red font-mono break-all">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-surface border border-white/10 rounded-full text-white font-medium flex items-center gap-2 hover:bg-white/5 transition-colors"
            >
              <Home size={16} />
              Réessayer
            </button>
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-action-purple rounded-full text-white font-medium flex items-center gap-2 hover:bg-purple-600 transition-colors shadow-lg"
            >
              <RefreshCw size={16} />
              Rafraîchir
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
