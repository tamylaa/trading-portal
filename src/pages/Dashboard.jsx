// src/pages/Dashboard.jsx - Professional Dashboard with Behavioral UX
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ContentManager } from '../components/content/ContentManager';
import ProfessionalDashboard from '../components/dashboard/ProfessionalDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout, isProfileComplete, token } = useAuth();
  const navigate = useNavigate();
  
  // Debug: Log when component renders and user data changes
  useEffect(() => {
    console.log('Dashboard component rendered with user:', currentUser);
    console.log('Dashboard auth token:', token ? 'Token available' : 'No token');
  }, [currentUser, token]);
  
  const handleEditProfile = () => {
    console.log('Current User Data for edit:', currentUser);
    console.log('Profile complete status:', isProfileComplete);
    
    // Prepare user data using normalized structure 
    const userData = {
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      company: currentUser?.company || '',
      position: currentUser?.position || '',
    };
    
    console.log('Passing to CompleteProfile:', userData);
    console.log('Individual field values:', {
      name: currentUser?.name,
      phone: currentUser?.phone,
      company: currentUser?.company,
      position: currentUser?.position
    });
    
    navigate('/complete-profile', { 
      state: { 
        userData,
        from: { pathname: '/dashboard' }
      } 
    });
  };

  return (
    <ProfessionalDashboard />
  );
};

export default Dashboard;