import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Workbox } from 'workbox-window';

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');
  wb.register();
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);