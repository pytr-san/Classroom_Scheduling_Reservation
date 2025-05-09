// axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      !originalRequest._retry &&
      !originalRequest.headers["no-refresh"]
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await axiosInstance.post("/auth/refresh");

        localStorage.setItem("accessToken", data.token);

        originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        localStorage.clear(); 
        window.location.href = "/login"; 
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
