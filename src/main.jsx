import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import './reader.css';
import './plans.css';
import './app-layout.css';
import './mobile-compact.css';
import './plan-days-compact.css';
import './plan-reading-polish.css';
import './reading-back-inline.css';

const rootElement = document.getElementById('root');

function mountEmergencyFallback() {
  if (!rootElement) return;

  rootElement.innerHTML = `
    <main style="min-height:100vh;padding:32px 24px 120px;background:#fff8ed;color:#071d3a;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <div style="max-width:760px;margin:0 auto">
        <span style="display:inline-block;margin-bottom:12px;color:#c99a38;font-weight:900;letter-spacing:.08em;text-transform:uppercase">Sembrando Esperanza</span>
        <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.8rem,9vw,4.6rem);line-height:.96;color:#071d3a">Página en recuperación</h1>
        <p style="margin:0 0 20px;color:#64748b;font-size:1.08rem;line-height:1.55">Se está restaurando la vista pública. Recarga en unos segundos.</p>
        <a href="/" style="display:inline-flex;padding:13px 18px;color:#fff;background:#0f513f;border-radius:14px;text-decoration:none;font-weight:900">Volver al inicio</a>
      </div>
    </main>
  `;
}

try {
  if (!rootElement) {
    throw new Error('No existe el contenedor #root.');
  }

  createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );

  window.setTimeout(() => {
    if (rootElement && rootElement.children.length === 0) {
      mountEmergencyFallback();
    }
  }, 2500);
} catch (error) {
  console.error('No se pudo iniciar Sembrando Esperanza:', error);
  mountEmergencyFallback();
}
