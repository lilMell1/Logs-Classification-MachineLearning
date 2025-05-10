import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUsername } from '../redux/slice';
import { RootState } from '../redux/store';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { checkAccessToken } from '../utils/checkAccessToken';
import '../css/homePage.css';
import { handleLogoutUtil } from '../utils/logoutUtil';
import PageTitle from '../elements/PageTitle';
import { FaFlask, FaHistory, FaCog, FaChartLine, FaUserShield, FaSignOutAlt } from 'react-icons/fa'; 

interface JwtPayload {
  username: string;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
      await handleLogoutUtil(refreshToken, dispatch, navigate);
  };

  const handleNewResearch = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate('/logsPage');
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
      {/* Optional background decoration */}
      <div className="hp-background-decor"></div>

      <div className='hp-header'>
        <button className="hp-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt style={{ marginRight: 8 }} />
          Logout
        </button>
      </div>

      <div className="hp-main-content">
        <h1 className="hp-username">Hello {username}</h1>
        <p className="hp-subtitle">What would you like to do today?</p>
          <div className="hp-buttons-container">
            <button className="hp-button" onClick={handleNewResearch}>
              <div className="hp-button-inner">
                <FaFlask size={28} />
                <span>New Logs Research</span>
              </div>
            </button>

            <button className="hp-button" onClick={settingsPage}>
              <div className="hp-button-inner">
                <FaCog size={28} />
                <span>Settings</span>
              </div>
            </button>

            
            <button className="hp-button" onClick={() => navigate("/combinedResults")}>
            <div className="hp-button-inner">
              <FaChartLine size={28} />
              <span>logs Results</span>
            </div>
            </button>

            {role === "admin" && (
              <button className="hp-button" onClick={handleAdminPage}>
                <div className="hp-button-inner">
                  <FaUserShield size={28} />
                  <span>Admin Panel</span>
                </div>
              </button>
            )}
          </div>
       </div>
    </div>
  );
};

export default HomePage;
