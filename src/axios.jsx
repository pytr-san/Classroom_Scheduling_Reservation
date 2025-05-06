// axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

// Request Interceptor — Attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — Handle 401 and retry with refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.headers["no-refresh"]) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry && token) {
      originalRequest._retry = true;

      try {
        const res = await axiosInstance.get("/auth/refresh");

        const newToken = res.data.token;
        localStorage.setItem("accessToken", newToken);

        // Update header and retry request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest); // ✅ fixed
      } catch (refreshError) {
        console.error("🔁 Token refresh failed", refreshError);
        // You might want to clear tokens and redirect to login here
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
