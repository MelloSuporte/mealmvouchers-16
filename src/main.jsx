import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Função para desregistrar o service worker
const unregisterServiceWorker = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
  } catch (error) {
    console.error('Erro ao desregistrar service worker:', error);
  }
};

// Monitorar estado da conexão
window.addEventListener('offline', () => {
  unregisterServiceWorker();
});

window.addEventListener('online', () => {
  window.location.reload();
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);