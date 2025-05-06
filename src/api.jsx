// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8000",
//   withCredentials: true, // send cookies (for refresh token)
// });

// // Request Interceptor — Attach access token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );


// // Response Interceptor — Handle 401 and retry with refresh token
// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originalRequest = error.config;
  
//       // If token is expired and we haven't retried yet
//       if (error.response?.status === 401 && !originalRequest._retry) {
//         originalRequest._retry = true;
  
//         try {
//           const res = await axios.get("http://localhost:8000/auth/refresh", {
//             withCredentials: true, // Refresh token is in cookie
//           });
  
//           const newToken = res.data.token;
//           localStorage.setItem("accessToken", newToken);
  
//           // Update header and retry request
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           return api(originalRequest);
//         } catch (refreshError) {
//           console.error("🔁 Token refresh failed", refreshError);
//           // Optionally clear auth and redirect to login
//         }
//       }
  
//       return Promise.reject(error);
//     }
//   );
  


// export default api;
