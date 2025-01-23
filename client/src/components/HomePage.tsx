import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slice';
import { RootState } from '../redux/store'; // Import Redux store
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { checkAccessToken } from '../utils/checkAccessToken';
import '../css/homePage.css';
import { handleLogoutUtil } from '../utils/logoutUtil'; // Import utility function

interface JwtPayload {
  username: string;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get tokens from Redux store
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);

  let username = '';
  if (accessToken) {
    const decoded = jwtDecode<JwtPayload>(accessToken); // Decode the token
    username = decoded.username; // Extract username
  }

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


  return (
    <div className='hp-main-div'>
      <div className='hp-logout-div'>
        <button className="hp-logout-btn" onClick={handleLogout}>
        Logout
        </button>
      </div>
      <div className="hp-search-div">
        {/* Username Display */}
        <h1 className="hp-username">Hello {username}</h1>

        {/* Buttons Section */}
        <div className="hp-buttons">
          <button
            className="hp-new-research-btn"
            onClick={handleNewResearch} // Attach navigation function
          >
            New Research
          </button>
          <button className="hp-researches">Researches</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
