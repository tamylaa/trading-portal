// src/pages/Dashboard.jsx - Professional Dashboard with Behavioral UX
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfessionalDashboard from '../components/dashboard/ProfessionalDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, token } = useAuth();
  
  // Debug: Log when component renders and user data changes
  useEffect(() => {
    console.log('Dashboard component rendered with user:', currentUser);
    console.log('Dashboard auth token:', token ? 'Token available' : 'No token');
  }, [currentUser, token]);

  return (
    <ProfessionalDashboard />
  );
};

export default Dashboard;