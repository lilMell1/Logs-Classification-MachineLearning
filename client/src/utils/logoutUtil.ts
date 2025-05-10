import axios from 'axios';
import { Dispatch } from 'redux';
import { logout } from '../redux/slice';
import { NavigateFunction } from 'react-router-dom';
import { persistor } from '../redux/store'; 

export const handleLogoutUtil = async (
  refreshToken: string | null | undefined,
  dispatch: Dispatch,
  navigate: NavigateFunction
): Promise<void> => {
  try {
    if (refreshToken) {
      await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/api/logout`, {
        refreshToken,
      });
    } else {
      console.warn("No refresh token found during logout. Proceeding with client cleanup.");
    }

    sessionStorage.clear(); // Clear other app-specific keys
    localStorage.clear();   // Optional: if using localStorage too

    dispatch(logout());
    navigate('/login');
  } catch (err) {
    console.error('Logout Error:', err);
    sessionStorage.clear();
    localStorage.clear();
    dispatch(logout());
    navigate('/login');
  }
};
