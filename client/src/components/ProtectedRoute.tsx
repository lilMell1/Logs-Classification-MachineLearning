import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import axios from 'axios';
import { login, logout } from '../redux/slice';

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

const ProtectedRoute: React.FC = () => {
  const dispatch = useDispatch();

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const username = useSelector((state: RootState) => state.auth.username);
  const userId = useSelector((state: RootState) => state.auth.userId);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAccessToken = async () => {
      if (!accessToken && !refreshToken) {
        dispatch(logout());
        setLoading(false);
        return;
      }

      try {
        if (!accessToken && refreshToken) {
          const response = await axios.post<TokenResponse>(
            `${process.env.REACT_APP_SERVER_BASE_URL}/api/refresh-token`,
            { refreshToken }
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

          dispatch(login({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || refreshToken,
            username: username || '',
            userId: userId || ''
          }));
        }
      } catch (error: any) {
        console.error('Token Refresh Error:', error.response?.data?.message || error.message);
        dispatch(logout());
        return;
      } finally {
        setLoading(false);
      }
    };

    verifyAccessToken();
  }, [accessToken, refreshToken, dispatch, username, userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return accessToken ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
