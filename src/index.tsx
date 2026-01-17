import React from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import './index.scss';
import 'react-toastify/dist/ReactToastify.css';
import AppRouter from './AppRouter';
import { ToastContainer } from 'react-toastify';
import { initWebVitalsMonitoring } from './utils/performanceMonitoring';

const root: Root = createRoot(document.getElementById('root') as Element);
root.render(
  <React.StrictMode>
    <div hidden>{process.env.REACT_APP_VERSION}</div>
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
    />
    <AppRouter />
  </React.StrictMode>,
);

// Initialize Web Vitals monitoring
initWebVitalsMonitoring();
