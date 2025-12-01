import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Error Boundary Component to catch crashes
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ff4444', backgroundColor: '#121214', height: '100vh', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{fontSize: '24px', marginBottom: '10px'}}>Something went wrong.</h1>
          <p style={{color: '#fff', marginBottom: '20px'}}>L'application a rencontré une erreur critique au démarrage.</p>
          <pre style={{ background: '#000', padding: '15px', borderRadius: '8px', overflow: 'auto', maxWidth: '90%', border: '1px solid #333' }}>
            {this.state.error?.toString()}
          </pre>
          <p style={{ marginTop: '20px', color: '#888', fontSize: '14px', textAlign: 'center' }}>
            Si vous voyez "API Key missing", assurez-vous d'avoir configuré <b>VITE_API_KEY</b> ou <b>NEXT_PUBLIC_API_KEY</b> dans Vercel.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '12px 24px', background: '#32D583', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '50px', cursor: 'pointer' }}
          >
            Recharger
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);