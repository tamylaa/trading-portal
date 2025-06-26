import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [contact, setContact] = useState({ email: '', phone: '' });
  const [country, setCountry] = useState('IN');
  const [otpId, setOtpId] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, verifyOTP } = useAuth();

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Determine which contact method was used (email or phone)
      const contactValue = contact.email || contact.phone;
      if (!contactValue) {
        throw new Error('Please enter an email or phone number');
      }
      
      const response = await login({ contact: contactValue, country });
      if (response?.otpId) {
        setOtpId(response.otpId);
        // In development, log the OTP if it's returned for testing
        if (process.env.NODE_ENV === 'development' && response.otp) {
          console.log('OTP for testing:', response.otp);
          setOtp(response.otp);
        }
      } else {
        throw new Error('Failed to get OTP ID from server');
      }
    } catch (err) {
      console.error('Error in handleContactSubmit:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!otpId) {
        throw new Error('Session expired. Please request a new OTP.');
      }
      if (!otp || otp.length < 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }
      
      await verifyOTP(otpId, otp);
      // On successful verification, the AuthContext will handle the redirect
    } catch (err) {
      console.error('Error in handleOtpSubmit:', err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign In</h2>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {!otpId ? 
          <form onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label>Email or Phone</label>
              <div className="contact-options">
                <div className="email-option" style={{ marginBottom: '10px' }}>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={contact.email}
                    onChange={(e) => setContact({ email: e.target.value, phone: '' })}
                    className={contact.phone ? '' : 'active'}
                    disabled={loading}
                  />
                </div>
                <div className="divider">
                  <span>OR</span>
                </div>
                <div className="phone-option" style={{ marginTop: '10px' }}>
                  <div className="phone-input-group">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={loading}
                      className="country-select"
                    >
                      <option value="IN">+91 (India)</option>
                      <option value="US">+1 (USA)</option>
                      <option value="UK">+44 (UK)</option>
                      <option value="AE">+971 (UAE)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={contact.phone}
                      onChange={(e) => setContact({ phone: e.target.value, email: '' })}
                      disabled={loading}
                      className={contact.email ? '' : 'active'}
                    />
                  </div>
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || (!contact.email && !contact.phone)}
              className={`submit-button ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form> : 
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying OTP...' : 'Verify OTP'}
            </button>
          </form>
        }
      </div>
    </div>
  );
};

export default Login;
