import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import axios from 'axios';
import { login, logout } from '../redux/slice';

interface TokenResponse {
  accessToken: string;
  refreshToken?: string; // Optional in case it's not always returned
}

const ProtectedRoute: React.FC = () => {
  const dispatch = useDispatch();

  // Get tokens from Redux state
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const [loading, setLoading] = useState(true); // Handle async loading

  useEffect(() => {
      // 1. Check if both tokens are missing
      const verifyAccessToken = async () => {
      if (!accessToken && !refreshToken) {
        dispatch(logout());
        setLoading(false);
        return;
      }

      try {  
        // 2. Attempt to refresh access token if expired or missing
        if (!accessToken && refreshToken) {
          const response = await axios.post<TokenResponse>(
            `${process.env.REACT_APP_API_BASE_URL}/api/refresh-token`,
            { refreshToken }
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

          // Update Redux with the new tokens
          dispatch(login({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || refreshToken // Fallback to old refresh token
          }));
        }
      } catch (error: any) {
        console.error('Token Refresh Error:', error.response?.data?.message || error.message);

        // Log out and redirect to login
        dispatch(logout());
        return;
      } finally {
        setLoading(false); // Stop loading
      }
    };

    verifyAccessToken();
  }, [accessToken, refreshToken, dispatch]);

  // Wait until loading finishes
  if (loading) {
    return <p>Loading...</p>;
  }

  // Redirect to login if no valid access token
  return accessToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
