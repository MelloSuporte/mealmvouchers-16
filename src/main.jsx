import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Workbox } from 'workbox-window';

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');
  wb.register();
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento root não encontrado! Verifique se existe um elemento com id="root" no seu HTML.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);