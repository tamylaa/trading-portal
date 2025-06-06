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
      const response = await login(contact, country);
      if (response?.otpId) {
        setOtpId(response.otpId);
        setOtp(response.otp); // Set the OTP for testing
      } else {
        throw new Error('Invalid OTP response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!otpId || !otp) {
        throw new Error('OTP ID and OTP are required');
      }
      await verifyOTP(otpId, otp);
    } catch (err) {
      setError(err.message);
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
                <div className="email-option">
                  <input
                    type="email"
                    placeholder="Email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  />
                </div>
                <div className="phone-option">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="IN">+91 (India)</option>
                    <option value="US">+1 (USA)</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading}>
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
