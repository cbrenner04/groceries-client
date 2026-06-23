import React from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import AppRouter from './AppRouter';
import { ToastContainer } from 'react-toastify';
import { initWebVitalsMonitoring } from './utils/performanceMonitoring';

const root: Root = createRoot(document.getElementById('root') as Element);
root.render(
  <React.StrictMode>
    <div hidden>{import.meta.env.VITE_VERSION}</div>
    <ToastContainer
      limit={3}
      hideProgressBar
      autoClose={3000}
      theme="colored"
      position="top-right"
      closeOnClick
      pauseOnHover
      draggable
      pauseOnFocusLoss={false}
      rtl={false}
      data-testid="toast-container"
      closeButton={false}
    />
    <AppRouter />
  </React.StrictMode>,
);

// Initialize Web Vitals monitoring
initWebVitalsMonitoring();
