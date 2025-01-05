import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/loginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/register`, {
        email,
        password,
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
    <div className="lp-main-div">
      {/* Left Picture Section */}
      <div className="lp-picture-div"></div>

      {/* Right Form Section */}
      <div className="lp-login-main-div">
        <div className='lp-form-main-div'>
          <h2 className="lp-form-title">Login</h2>
          <form onSubmit={submitForm}>
            <div className="lp-login-email-div">
              <label htmlFor="lp-email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="lp-login-password-div">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="lp-submit-btn" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
        <p >
        Dont have an account? <Link to="/Register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
