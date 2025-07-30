import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { requestMagicLink, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ text: 'Please enter your email', type: 'error' });
      return;
    }

    if (isSignUp && !name) {
      setMessage({ text: 'Name is required for sign up', type: 'error' });
      return;
    }

    try {
      setMessage({ text: '', type: '' });
      await requestMagicLink(email, isSignUp ? name : undefined);
      setMagicLinkSent(true);
      setMessage({ 
        text: 'Check your email for the magic link to sign in.', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ 
        text: error.message || 'Failed to send magic link', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">{isSignUp ? 'Create your account' : 'Sign in to your account'}</h2>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {magicLinkSent ? (
          <div className="magic-link-sent">
            <div className="success-icon">✓</div>
            <h3 className="magic-link-title">Check Your Email</h3>
            <p className="magic-link-text">We've sent a magic link to <span className="email">{email}</span></p>
            <button
              type="button"
              className="resend-button"
              onClick={() => {
                setMagicLinkSent(false);
                setMessage({ text: '', type: '' });
              }}
            >
              Resend Magic Link
            </button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="form-input"
              />
            </div>

            <button type="submit" className="submit-button">
              {isSignUp ? 'Sign up' : 'Continue with Email'}
            </button>
          </form>
        )}

        <div className="auth-toggle">
          <p className="auth-toggle-text">
            {isSignUp ? 'Already have an account?' : 'New to our platform?'}
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage({ text: '', type: '' });
              }}
            >
              {isSignUp ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
