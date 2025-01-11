import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slice';
import { RootState } from '../redux/store'; // Import Redux store
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { checkAccessToken } from '../utils/checkAccessToken';
import '../css/homePage.css';

// JWT Payload interface
interface JwtPayload {
  username: string;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get tokens from Redux store
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);

  // Decode username from the access token
  let username = '';
  if (accessToken) {
    const decoded = jwtDecode<JwtPayload>(accessToken); // Decode the token
    username = decoded.username; // Extract username
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      // Send refresh token to the server to blacklist it
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/logout`, {
        refreshToken, // Send refresh token for blacklisting
      });

      // Clear Redux store tokens
      dispatch(logout());

      navigate('/login');
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  // **Navigate to Logs Page**
  const handleNewResearch = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate('/logsPage'); // Navigate only if the token is valid
    }
  };


  return (
    <div className="hp-main-div">
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

      {/* Logout Button */}
      <div className="hp-logout-div">
        <button className="hp-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default HomePage;
