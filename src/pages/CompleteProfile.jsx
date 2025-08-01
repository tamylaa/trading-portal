// src/pages/CompleteProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './CompleteProfile.css';

const CompleteProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    position: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Debug log the location state and current user
  useEffect(() => {
    console.log('=== COMPLETE PROFILE DEBUG ===');
    console.log('Location state:', location.state);
    console.log('userData from location:', location.state?.userData);
    console.log('Current User from context:', currentUser);
    console.log('Current formData:', formData);
    console.log('==============================');
  }, [location.state, currentUser, formData]);

  // Initialize form data when component mounts or when user data changes
  useEffect(() => {
    if (!currentUser) {
      console.log('No currentUser yet, skipping form initialization');
      return;
    }

    console.log('=== INITIALIZING FORM DATA ===');
    
    // Always use currentUser as the source of truth
    // location.state?.userData might be stale or incomplete
    const sourceData = currentUser;
    
    console.log('Using currentUser as source:', sourceData);
    
    const newFormData = {
      name: sourceData.name || '',
      phone: sourceData.phone || '',
      company: sourceData.company || '',
      position: sourceData.position || ''
    };
    
    console.log('Setting formData to:', newFormData);
    setFormData(newFormData);
    console.log('=================================');
    
  }, [currentUser]); // Only depend on currentUser, not location.state

  // Redirect if no user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: location } });
    }
  }, [currentUser, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        company: formData.company,
        position: formData.position
      });

      if (result.success) {
        setSuccess('Profile updated successfully! Redirecting...');
        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate(from, { replace: true, state: { profileUpdated: true } });
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null; // or a loading spinner
  }

  return (
    <div className="complete-profile-container">
      <div className="complete-profile-box">
        <h2 className="complete-profile-title">
          {location.state?.from?.pathname === '/dashboard' ? 'Edit Profile' : 'Complete Your Profile'}
        </h2>
        
        <div className="user-email">
          <span className="email-label">Account Email:</span>
          <span className="email-value">{currentUser.email}</span>
        </div>
        
        <p className="complete-profile-subtitle">
          {location.state?.from?.pathname === '/dashboard' 
            ? 'Update your profile information below.'
            : 'Please provide some additional information to complete your account setup.'}
        </p>

        {error && (
          <div className="error-message">
            <span className="error-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            <span>{success}</span>
          </div>
        )}

        <form className="complete-profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company" className="form-label">
              Company
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your company name (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="position" className="form-label">
              Position
            </label>
            <input
              id="position"
              name="position"
              type="text"
              value={formData.position}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your position (optional)"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;