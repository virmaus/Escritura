import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress benign Vite development server WebSocket connection/close rejections
if (typeof window !== 'undefined') {
  const isWebsocketError = (msg: string) => {
    return (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('WS') ||
      msg.includes('connection to')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (isWebsocketError(reason)) {
      event.preventDefault();
      console.warn('Intercetado y suprimido error benigno de WebSocket en desarrollo:', reason);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (isWebsocketError(msg)) {
      event.preventDefault();
      console.warn('Intercetado y suprimido error benigno de WebSocket en desarrollo:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
