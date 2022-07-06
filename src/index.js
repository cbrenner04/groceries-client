import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.css';
import './index.scss';
import AppRouter from './AppRouter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

const app = (
  <>
    <div hidden>{process.env.REACT_APP_VERSION}</div>
    <ToastContainer limit={3} hideProgressBar autoClose={2000} theme="colored" />
    <AppRouter />
  </>
);

const root = createRoot(document.getElementById('root'));
root.render(app);
