
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initBackgroundCanvas } from './themes/backgroundCanvas.ts';
import { initializeTheme } from './themes/main.ts';

// Initialize theme before rendering to prevent flash of unstyled content
initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Initialize background canvas after DOM is fully loaded
window.addEventListener('load', () => {
  console.log('Window loaded, initializing background canvas');
  initBackgroundCanvas();
});
