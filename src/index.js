import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.css';
import './index.scss';
import AppRouter from './AppRouter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const app = (
  <DndProvider backend={HTML5Backend}>
    <div hidden>{process.env.REACT_APP_VERSION}</div>
    <ToastContainer limit={3} hideProgressBar autoClose={2000} theme="colored" />
    <AppRouter />
  </DndProvider>
);

const root = createRoot(document.getElementById('root'));
root.render(app);
