import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
interface RefreshTokenResponse {
    accessToken: string;
}


// Create axios instance
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token expiration check
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp < Date.now() / 1000; // Expired if current time > exp
  } catch (error) {
    return true; // Treat invalid token as expired
  }
};

// Axios Request Interceptor
axiosInstance.interceptors.request.use(
    async (config: any) => {
        const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const navigate = useNavigate(); // React router navigation

    if (accessToken && isTokenExpired(accessToken)) {
      try {
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
          token: refreshToken,
        });

        const newAccessToken = (response.data as RefreshTokenResponse).accessToken;

        // Update the token in localStorage
        localStorage.setItem('accessToken', newAccessToken);

        // Attach the new access token to headers
        config.headers = config.headers || {}; // Ensure headers exist
        config.headers.Authorization = `Bearer ${accessToken}`;
              } catch (error) {
        console.error('Token refresh failed:', error);

        // If refresh token fails, log out and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    } else if (accessToken) {
        // If access token is valid, attach it to headers
        config.headers = config.headers || {}; // Ensure headers exist
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Return the updated config
    return Promise.resolve(config); // Ensure synchronous return
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
