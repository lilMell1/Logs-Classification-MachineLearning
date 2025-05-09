import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link,useNavigate  } from 'react-router-dom';
import { login } from '../redux/slice';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slice';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Animal from 'elements/animal';
import '../css/loginPage.css';
interface JwtPayload {
  username: string;
}
interface TokenResponse {
  username:string;
  userId:string;
  accessToken: string;
  refreshToken: string; 
  role: "admin" | "user" | "restricted";
}
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Redux Dispatch
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);

  useEffect(() => {
    const performLogout = async () => {      
      try {
        // Send refresh token to the backend to blacklist it
        if (refreshToken){
          await axios.post(`${process.env.REACT_APP_SERVER_BASE_URL}/api/logout`, {
            refreshToken,
          });
          dispatch(logout());
        }           

      } catch (err) {
        console.error('Logout Error:', err);
      }
    };

    performLogout(); // Call the async function inside useEffect
  },[]);

  const submitLoginForm = async (e: React.FormEvent) => {
    
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<TokenResponse>(`${process.env.REACT_APP_SERVER_BASE_URL}/api/login`, {
        email,
        password,
      });
      const { accessToken, refreshToken, username, userId, role } = response.data;
      dispatch(login({ accessToken, refreshToken, username, userId, role }));      
      console.log('login Successful:', response.data);
      navigate('/home');

    } catch (err: any) {
      console.error('login Error:', err);
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-page-wrapper">
      <div className="lp-main-div">
        {/* Left Picture Section */}
        <div className="lp-picture-div">
          <div className="container">
            <Animal />
          </div>
        </div>
  
        {/* Right Form Section */}
        <div className="lp-login-main-div">
          <div className="lp-form-main-div">
            <h2 className="lp-form-title">Login</h2>
            <form onSubmit={submitLoginForm}>
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
              <button
                onClick={submitLoginForm}
                type="submit"
                className="lp-submit-btn"
                disabled={loading}
              >
                Login
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
          <p style={{ fontSize: '18px', marginTop: '3vh' }}>
            Don't have an account?{' '}
            <Link style={{ color: 'blue' }} to="/Register">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
