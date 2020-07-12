import React from 'react';
import ReactDOM from 'react-dom';
import '@fortawesome/fontawesome-free/css/all.css';
import './index.scss';
import AppRouter from './AppRouter';
import * as serviceWorker from './serviceWorker';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

const app = (
  <>
    <ToastContainer limit={3} hideProgressBar autoClose={2000} />
    <AppRouter />
  </>
);

ReactDOM.render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
