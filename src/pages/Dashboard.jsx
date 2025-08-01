// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  
  const handleEditProfile = () => {
    console.log('Current User Data:', currentUser);
    
    // Prepare user data using normalized structure 
    const userData = {
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      company: currentUser?.company || '',
      position: currentUser?.position || '',
    };
    
    console.log('Passing to CompleteProfile:', userData);
    
    navigate('/complete-profile', { 
      state: { 
        userData,
        from: { pathname: '/dashboard' }
      } 
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p className="welcome-message">Welcome back, {currentUser?.name || 'User'}!</p>
          </div>
          
          <div className="profile-section">
            <h2>Profile Information</h2>
            <div className="profile-grid">
              <div className="profile-item">
                <label>Name</label>
                <div className="profile-value">{currentUser?.name || 'Not set'}</div>
              </div>
              
              <div className="profile-item">
                <label>Email</label>
                <div className="profile-value">{currentUser?.email || 'Not set'}</div>
              </div>
              
              <div className="profile-item">
                <label>Account Status</label>
                <div className="status-badge verified">
                  Verified
                </div>
              </div>
              
              {currentUser?.phone && (
                <div className="profile-item">
                  <label>Phone</label>
                  <div className="profile-value">{currentUser.phone}</div>
                </div>
              )}
              
              {currentUser?.company && (
                <div className="profile-item">
                  <label>Company</label>
                  <div className="profile-value">{currentUser.company}</div>
                </div>
              )}
              
              {currentUser?.position && (
                <div className="profile-item">
                  <label>Position</label>
                  <div className="profile-value">{currentUser.position}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="dashboard-actions">
            <button
              onClick={logout}
              className="logout-button"
            >
              Sign out
            </button>
            
            <button
              className="secondary-button"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;