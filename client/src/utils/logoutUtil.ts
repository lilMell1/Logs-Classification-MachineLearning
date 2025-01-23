import axios from 'axios';
import { Dispatch } from 'redux';
import { logout } from '../redux/slice';
import { NavigateFunction } from 'react-router-dom';

export const handleLogoutUtil = async (
  refreshToken: string,
  dispatch: Dispatch,
  navigate: NavigateFunction
): Promise<void> => {
  try {
    // Send refresh token to the server to blacklist it
    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/logout`, {
      refreshToken,
    });

    // Dispatch logout action to clear Redux state
    dispatch(logout());

    // Redirect to the login page
    navigate('/login');
  } catch (err) {
    console.error('Logout Error:', err);
  }
};
