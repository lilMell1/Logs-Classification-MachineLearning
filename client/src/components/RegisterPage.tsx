import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/registerPage.css'

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className='rp-main-div'>
      <h2 className='rp-form-title'>Register</h2>
      <form className='rp-form-div' onSubmit={handleSubmit}>
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
        <button type="submit" className='rp-submit-btn'>
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
