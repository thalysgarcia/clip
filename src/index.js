import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Tratamento de erros globais para evitar crashes
window.addEventListener('error', (event) => {
  console.warn('Erro global capturado:', event.error);
  // Evita que erros de extensões quebrem a aplicação
  if (event.error && event.error.message && 
      (event.error.message.includes('ethereum') || 
       event.error.message.includes('Cannot redefine property') ||
       event.error.message.includes('throttling'))) {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('Promise rejeitada capturada:', event.reason);
  event.preventDefault();
});

// Detectar Brave e aplicar configurações especiais
if (navigator.brave && navigator.brave.isBrave) {
  console.log('🔧 Brave detectado - aplicando configurações especiais');
  // Desabilitar algumas proteções agressivas do Brave se necessário
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

