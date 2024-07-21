import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.css';
import './index.scss';
import AppRouter from './AppRouter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

const root: Root = createRoot(document.getElementById('root') as Element);
root.render(
  <React.StrictMode>
    <div hidden>{process.env.REACT_APP_VERSION}</div>
    <ToastContainer limit={3} hideProgressBar autoClose={2000} theme="colored" />
    <AppRouter />
  </React.StrictMode>,
);
