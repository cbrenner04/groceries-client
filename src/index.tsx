import React from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.css';
import './index.scss';
import 'react-toastify/dist/ReactToastify.css';
import AppRouter from './AppRouter';
import { ToastContainer } from 'react-toastify';

// Create root with concurrent features enabled
// React 19 uses concurrent rendering by default, which can cause the error:
// "There was an error during concurrent rendering but React was able to recover by instead synchronously rendering the
// entire root"
// The usePolling hook and batchStateUpdates utility help mitigate this issue
const root: Root = createRoot(document.getElementById('root') as Element);
root.render(
  <React.StrictMode>
    <div hidden>{process.env.REACT_APP_VERSION}</div>
    <ToastContainer
      limit={3}
      hideProgressBar
      autoClose={2000}
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
