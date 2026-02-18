import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Reference to public/index.html entry point
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// CRA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
