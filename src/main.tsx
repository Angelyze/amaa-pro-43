
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import initializeTheme from './themes/main.ts';
import { initBackgroundCanvas } from './themes/backgroundCanvas.ts';

// Initialize theme before rendering
initializeTheme();

// Initialize background canvas
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
