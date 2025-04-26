import axios from 'axios';
import { store } from '../redux/store';
import { login, logout } from '../redux/slice';
import { jwtDecode } from 'jwt-decode';
import { NavigateFunction } from 'react-router-dom';
import moment from 'moment-timezone';

interface JwtPayload {
  exp: number;
}

interface RefreshTokenResponse {
  accessToken: string;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = moment().tz('Asia/Jerusalem').valueOf();
    return decoded.exp * 1000 < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

export const checkAccessToken = async (navigate: NavigateFunction): Promise<boolean> => {
  const state = store.getState();
  const { accessToken, refreshToken, username, userId } = state.auth; // ✅ מוסיפים גם username ו-userId
  const dispatch = store.dispatch;

  if (accessToken) {
    if (!isTokenExpired(accessToken)) {
      return true;
    }
  }

  if (refreshToken) {
    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${process.env.REACT_APP_API_BASE_URL}/api/refresh-token`,
        { refreshToken }
      );

      const { accessToken: newAccessToken } = response.data;

      dispatch(login({
        accessToken: newAccessToken,
        refreshToken,
        username: username || '',
        userId: userId || ''
      }));

      return true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('Refresh token has expired. Logging out.');
      } else if (error.response?.status === 403) {
        console.error('Refresh token is blacklisted or invalid. Logging out.');
      } else {
        console.error('Token refresh failed:', error);
      }
    }
  }

  dispatch(logout());
  navigate('/login');
  return false;
};
