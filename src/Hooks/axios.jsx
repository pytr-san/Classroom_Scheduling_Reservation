// axios.js
import axios from 'axios';

const axios = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

export default axios;
