/* istanbul ignore file */
import axios from 'axios';
import { setUserInfo } from './auth';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
});

instance.interceptors.request.use(function (config) {
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    config.headers = JSON.parse(sessionUser);
  }
  return config;
});

instance.interceptors.response.use(
  function (response) {
    // TODO: figure this out
    setUserInfo(response.headers as { 'access-token': string; uid: string; client: string });
    return response;
  },
  function (error) {
    if (error?.response?.headers) {
      setUserInfo(error.response.headers);
    }
    return Promise.reject(error);
  },
);

export default instance;
