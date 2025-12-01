import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('[Love3 Debug] index.tsx: Script loaded at', new Date().toISOString());

function showFatalError(message: string, error?: unknown) {
  console.error('[Love3 Debug] FATAL:', message, error);
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;inset:0;background:#121214;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;font-family:sans-serif;z-index:99999';
  errorDiv.innerHTML = `
    <div style="max-width:400px;text-align:center">
      <h1 style="color:#E84B3C;font-size:24px;margin-bottom:16px">Erreur de chargement</h1>
      <p style="color:#888;margin-bottom:16px">${message}</p>
      <p style="color:#666;font-size:12px;word-break:break-all">${error instanceof Error ? error.message : String(error || '')}</p>
      <button onclick="location.reload()" style="margin-top:24px;padding:12px 24px;background:#7B4CF6;color:white;border:none;border-radius:999px;cursor:pointer;font-weight:600">
        Recharger
      </button>
    </div>
  `;
  document.body.innerHTML = '';
  document.body.appendChild(errorDiv);
}

function initApp() {
  try {
    console.log('[Love3 Debug] Searching for root element...');
    let rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.warn('[Love3 Debug] Root element not found, creating one...');
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
      console.log('[Love3 Debug] Root element created');
    }
    
    console.log('[Love3 Debug] Root element ready:', rootElement);
    console.log('[Love3 Debug] Creating React root...');
    
    const root = createRoot(rootElement);
    
    console.log('[Love3 Debug] React root created, rendering app...');
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('[Love3 Debug] App rendered successfully');
  } catch (error) {
    console.error('[Love3 Debug] Fatal error during initialization:', error);
    showFatalError('Impossible de démarrer l\'application', error);
  }
}

if (document.readyState === 'loading') {
  console.log('[Love3 Debug] Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  console.log('[Love3 Debug] Document ready, initializing immediately...');
  initApp();
}
