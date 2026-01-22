import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './i18n';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

// Clean, consistent approach for both dev and production
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);