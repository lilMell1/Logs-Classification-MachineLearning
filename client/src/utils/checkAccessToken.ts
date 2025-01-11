import axios from 'axios';
import { store } from '../redux/store';
import { login, logout } from '../redux/slice';
import {jwtDecode} from 'jwt-decode';
import { NavigateFunction } from 'react-router-dom';

interface JwtPayload {
  exp: number; // Token expiration timestamp (in seconds)
}

interface RefreshTokenResponse {
  accessToken: string;
}

// Utility to check if a token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 < Date.now(); // Compare expiration with current time
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Treat invalid tokens as expired
  }
};

// Main function to validate access token
export const checkAccessToken = async (navigate: NavigateFunction): Promise<boolean> => {
  const state = store.getState(); // Access current Redux state
  const { accessToken, refreshToken } = state.auth; // Extract tokens
  const dispatch = store.dispatch; // Access Redux dispatch

  // Step 1: Check if the access token is valid
  if (accessToken) {
    if (!isTokenExpired(accessToken)) {
      return true; // Token is valid
    }
  }

  // Step 2: If the access token is expired, attempt to refresh it
  if (refreshToken) {
    try {
      // Send refresh token to the backend
      const response = await axios.post<RefreshTokenResponse>(
        `${process.env.REACT_APP_API_BASE_URL}/api/refresh-token`,
        { refreshToken } // Only send the refresh token now
      );

      const { accessToken: newAccessToken } = response.data;

      // Update Redux with the new access token
      dispatch(login({ accessToken: newAccessToken, refreshToken }));

      return true; // Successfully refreshed the token
    } catch (error: any) {
      // Handle backend errors (e.g., blacklisted or expired refresh token)
      if (error.response?.status === 401) {
        console.error('Refresh token has expired. Logging out.');
      } else if (error.response?.status === 403) {
        console.error('Refresh token is blacklisted or invalid. Logging out.');
      } else {
        console.error('Token refresh failed:', error);
      }
    }
  }

  // Step 3: Log out and redirect to login if tokens are invalid or refresh fails
  dispatch(logout());
  navigate('/login');
  return false;
};
