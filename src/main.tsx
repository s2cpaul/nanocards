import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// Global error handler
window.addEventListener('error', (event) => {
  console.error('[Global Error]:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]:', event.reason);
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

// Enable performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`[Performance] Page load time: ${pageLoadTime}ms`);
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('[App Mount Error]:', error);
  // Display a fallback error message
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(to bottom right, #1e3a8a, #312e81); color: white; font-family: system-ui, -apple-system, sans-serif;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">Unable to Load App</h1>
        <p style="margin-bottom: 1.5rem; opacity: 0.9;">Please check your browser console for details.</p>
        <button onclick="window.location.reload()" style="background: white; color: #1e3a8a; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}
