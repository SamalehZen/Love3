import React from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.info('Une nouvelle version d’Overlay est disponible. Actualisez pour mettre à jour.');
  },
  onOfflineReady() {
    console.info('Overlay est prêt à fonctionner hors ligne.');
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
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
