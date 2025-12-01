import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

console.log('[Love3 Debug] ErrorBoundary.tsx: Module loaded');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    console.log('[Love3 Debug] ErrorBoundary constructed');
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('[Love3 Debug] ErrorBoundary getDerivedStateFromError:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Love3 Debug] === ERROR BOUNDARY CAUGHT ERROR ===');
    console.error('[Love3 Debug] Error name:', error.name);
    console.error('[Love3 Debug] Error message:', error.message);
    console.error('[Love3 Debug] Error stack:', error.stack);
    console.error('[Love3 Debug] Component stack:', errorInfo.componentStack);
    
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    console.log('[Love3 Debug] ErrorBoundary render, hasError:', this.state.hasError);
    
    if (this.state.hasError) {
      console.log('[Love3 Debug] Rendering error fallback UI');
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '24px',
          padding: '32px',
          backgroundColor: '#121214',
          color: 'white',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(232, 75, 60, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle color="#E84B3C" size={40} />
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '8px' }}>
              Oops, quelque chose s'est mal passé
            </h2>
            <p style={{ color: '#888', fontSize: '14px', maxWidth: '280px', lineHeight: '1.5' }}>
              Une erreur inattendue s'est produite. Veuillez réessayer ou recharger la page.
            </p>
          </div>

          {this.state.error && (
            <div style={{
              width: '100%',
              maxWidth: '350px',
              padding: '16px',
              backgroundColor: '#1C1C1E',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#E84B3C',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {this.state.error.message}
              </p>
              {this.state.error.stack && (
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ color: '#666', fontSize: '11px', cursor: 'pointer' }}>
                    Stack trace
                  </summary>
                  <pre style={{
                    fontSize: '10px',
                    color: '#666',
                    marginTop: '8px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1C1C1E',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                color: 'white',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Home size={16} />
              Réessayer
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                backgroundColor: '#7B4CF6',
                border: 'none',
                borderRadius: '999px',
                color: 'white',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(123, 76, 246, 0.3)'
              }}
            >
              <RefreshCw size={16} />
              Rafraîchir
            </button>
          </div>
        </div>
      );
    }

    console.log('[Love3 Debug] ErrorBoundary rendering children');
    return this.props.children;
  }
}
