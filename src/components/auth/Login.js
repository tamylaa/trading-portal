import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
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
    setError('');
    setLoading(true);
    
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      
      if (isSignUp && !name) {
        throw new Error('Name is required for sign up');
      }
      
      await requestMagicLink(email, isSignUp ? name : undefined);
      setMagicLinkSent(true);
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {magicLinkSent ? (
          <div className="magic-link-sent">
            <div className="success-icon">✓</div>
            <h3>Check Your Email</h3>
            <p>We've sent a magic link to <strong>{email}</strong></p>
            <p>Click the link to {isSignUp ? 'complete your registration' : 'sign in'}.</p>
            <button 
              className="resend-button"
              onClick={() => {
                setMagicLinkSent(false);
                setError('');
              }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Resend Magic Link'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Continue with Email'}
            </button>

            <div className="switch-auth-mode">
              {isSignUp ? (
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    className="text-button"
                    onClick={() => setIsSignUp(false)}
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    className="text-button"
                    onClick={() => setIsSignUp(true)}
                    disabled={loading}
                  >
                    Sign Up
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
