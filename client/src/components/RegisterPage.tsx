import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/registerPage.css'

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitRegisterForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/register`, {
        email,
        password,
        username
      });

      console.log('Registration Successful:', response.data);
      alert('Registration successful!');
    } catch (err: any) {
      console.error('Registration Error:', err);
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='rp-main-div'>
      <h2 className='rp-form-title'>Register</h2>
      <form className='rp-form-div' onSubmit={submitRegisterForm}>
        <div className='rp-input-div rp-username-div'>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            className="rp-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className='rp-input-div rp-email-div'>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            className="rp-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='rp-input-div rp-password-div'>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            className="rp-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className='rp-input-div rp-confirm-password-div'>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            className="rp-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button onClick={submitRegisterForm} type="submit" className='rp-submit-btn'>
          Register
        </button>
      </form>
      <br />
      <p className='rp-link'>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
      <p className='rp-link'>
        <Link to="/">Back to Home</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
