import axios from 'axios';
import { setUserInfo } from './auth';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
});

instance.interceptors.request.use(function(config) {
  config.headers = JSON.parse(sessionStorage.getItem('user'));
  return config;
});

instance.interceptors.response.use(
  function(response) {
    setUserInfo(response.headers);
    return response;
  },
  function(error) {
    if (error && error.response && error.response.headers) {
      setUserInfo(error.response.headers);
    }
    return Promise.reject(error);
  },
);

export default instance;
