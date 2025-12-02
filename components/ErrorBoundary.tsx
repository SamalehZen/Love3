import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
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
          
          <div className="text-center max-w-sm">
            <h2 className="text-white font-bold text-xl mb-2">
              Oops, quelque chose s'est mal passé
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-2">
              L'application a rencontré une erreur inattendue. Veuillez réessayer.
            </p>
            
            {this.state.error && (
              <details className="text-left mt-4 mb-4">
                <summary className="text-gray-600 text-xs cursor-pointer hover:text-gray-400 transition-colors">
                  Détails techniques
                </summary>
                <pre className="mt-2 p-3 bg-black/50 rounded-xl text-action-red text-xs overflow-auto max-h-32 border border-white/5">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <span className="text-gray-500">{this.state.errorInfo.componentStack}</span>
                  )}
                </pre>
              </details>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-surface border border-white/10 rounded-full text-white font-medium text-sm hover:bg-white/10 transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-action-purple rounded-full text-white font-medium text-sm flex items-center gap-2 hover:bg-purple-600 transition-colors"
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

export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};
