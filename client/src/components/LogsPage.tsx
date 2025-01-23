import React from 'react';
import '../css/logsPage.css';
import { handleLogoutUtil } from '../utils/logoutUtil'; // Import utility function
import { RootState } from '../redux/store'; // Import Redux store
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkAccessToken } from '../utils/checkAccessToken';

function LogsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);

  const handleLogout = async () => {
    if (refreshToken) {
      await handleLogoutUtil(refreshToken, dispatch, navigate);
    }
  };

  const handleHomePage = async () =>{
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate('/home'); // Navigate only if the token is valid
    }  }

  return (
    <>
    <div className='logout-div'>
      <button className="hp-logout-btn"  onClick={handleLogout}>
      Logout
      </button>
      <button className="hp-home-btn" onClick={handleHomePage}>
      Home
      </button>
    </div>
    <div className="logs-page">
      <div>
        <label htmlFor="insert-index">index:</label>
        <input
          type="number"
          id="index"
          required
        />
        <button>search</button>
      </div>
    </div>
    </>
  );
}

export default LogsPage;
