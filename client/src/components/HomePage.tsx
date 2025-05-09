import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout,setUsername } from '../redux/slice';
import { RootState } from '../redux/store'; // Import Redux store
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { checkAccessToken } from '../utils/checkAccessToken';
import '../css/homePage.css';
import { handleLogoutUtil } from '../utils/logoutUtil'; // Import utility function
import PageTitle from '../elements/PageTitle';

interface JwtPayload {
  username: string;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get tokens from Redux store
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const username = useSelector((state: RootState) => state.auth.username);
  const role = useSelector((state: RootState) => state.auth.role);

  useEffect(() => {
    if (!username && accessToken) {
      try {
        const decoded: JwtPayload = jwtDecode(accessToken);
        if (decoded.username) {
          dispatch(setUsername(decoded.username)); 
        }
      } catch (error) {
        console.error("Failed to decode access token:", error);
      }
    }
  }, [username, accessToken, dispatch]);

  // Logout handler
  const handleLogout = async () => {
    if (refreshToken) {
      await handleLogoutUtil(refreshToken, dispatch, navigate);
    }
  };

  const handleNewResearch = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate('/logsPage'); // Navigate only if the token is valid
    }
  };

  const handleMachineStatsPage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate("/machineStats");
    }
  };
    
  const handleAdminPage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate('/admin');
    }
  };
  
  const ResearchesData = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate('/researchesPage'); 
    }
  };
  const settingsPage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate('/settings'); 
    }
  };

  return (
    <div className='hp-container'>
      <div className='hp-header'>
        <button className="hp-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="hp-main-content">
        <h1 className="hp-username">Hello {username}</h1>
        <div className="hp-buttons-container">
          <button className="hp-new-research-btn" onClick={handleNewResearch}>New Research</button>
          <button className="hp-researches-btn" onClick={ResearchesData}>Researches</button>
          <button className="hp-settings-btn" onClick={settingsPage}>Settings</button>
          <button className="hp-machine-btn" onClick={handleMachineStatsPage}>Machine stats</button>
          {role === "admin" && (
            <button className="hp-admin-btn" onClick={handleAdminPage}>Admin Panel</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
