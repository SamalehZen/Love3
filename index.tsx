import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('[Love3 Debug] index.tsx: Script loaded');
console.log('[Love3 Debug] Environment:', {
  nodeEnv: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
  isProd: import.meta.env.PROD,
  timestamp: new Date().toISOString()
});

console.log('[Love3 Debug] Searching for root element...');
const rootElement = document.getElementById('root');
console.log('[Love3 Debug] Root element found:', !!rootElement, rootElement);

if (!rootElement) {
  console.error('[Love3 Debug] FATAL: Root element not found in DOM');
  console.error('[Love3 Debug] Document body:', document.body.innerHTML.substring(0, 500));
  throw new Error("Could not find root element to mount to");
}

console.log('[Love3 Debug] Creating React root...');
try {
  const root = createRoot(rootElement);
  console.log('[Love3 Debug] React root created, starting render...');
  
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
  
  console.log('[Love3 Debug] render() called successfully');
} catch (error) {
  console.error('[Love3 Debug] FATAL: Error during React initialization:', error);
  console.error('[Love3 Debug] Error stack:', error instanceof Error ? error.stack : 'No stack');
}
