import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Normalize base URL: ensure no trailing '/api'
const rawBase = (process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000').replace(/\/$/, '');
const baseURL = rawBase.endsWith('/api') ? rawBase.replace(/\/api$/, '') : rawBase;

// Create axios instance for client-side requests
const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${baseURL}/api/auth/refresh-token`,
            {
              refreshToken,
            }
          );

          const { accessToken } = response.data;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
