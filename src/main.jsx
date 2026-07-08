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

// Build marker: recovery fix for public production render.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
