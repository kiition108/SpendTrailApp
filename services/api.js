import axios from 'axios';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../config/constants';

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
