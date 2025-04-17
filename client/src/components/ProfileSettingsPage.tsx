// ProfileSettingsPage.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RootState } from '../redux/store';
import { setUsername } from '../redux/slice';
import '../css/profileSettings.css';

const ProfileSettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const currentUsername = useSelector((state: RootState) => state.auth.username);
  const [newUsername, setNewUsername] = useState('');

  const handleUsernameChange = async () => {
    try {
      console.log("Access token:", accessToken);
      await axios.put(
        `${process.env.REACT_APP_SERVER_BASE_URL}/userApi/change-username`,
        { newUsername },
        { headers: { Authorization: `Bearer ${accessToken}` }, withCredentials: true }
      );
      dispatch(setUsername(newUsername));
      setNewUsername('');
      alert('Username updated');
    } catch (err) {
      alert('Failed to update username');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/userApi/delete-user`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      alert('User deleted');
      navigate('/');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="profile-container">
      <div className='home-header'>
        <button className="home-logout-btn" onClick={() => navigate('/')}>Back to Home</button>
      </div>
      <div className="profile-content">
        <h1 className="profile-title">Profile Settings</h1>

        <p className="profile-current-username">Current Username: <strong>{currentUsername}</strong></p>

        <label className="profile-label">Change Username</label>
        <input
          type="text"
          className="profile-input"
          placeholder="New Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />

        <div className="profile-button-group">
          <button className="profile-save-btn" onClick={handleUsernameChange}>Save</button>
          <button className="profile-delete-btn" onClick={handleDeleteUser}>Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;