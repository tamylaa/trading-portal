// Professional Dashboard with Behavioral Psychology UX
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { uiActions } from '../../store';
import './ProfessionalDashboard.css';

// Dashboard Widgets
import SidebarNavigation from './components/SidebarNavigation';
import DashboardOverview from './components/DashboardOverview';
import ProgressTracker from './components/ProgressTracker';
import QuickActions from './components/QuickActions';
import { ContentLibrary, Analytics, Achievements } from './components/WidgetComponents';

const ProfessionalDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  
  // Redux state
  const sidebar = useAppSelector(state => state.ui.sidebar);
  const theme = useAppSelector(state => state.ui.theme);
  const viewport = useAppSelector(state => state.ui.viewport);
  
  // Local state for dashboard
  const [activeWidget, setActiveWidget] = useState('overview');
  const [dailyStreak, setDailyStreak] = useState(7);
  const [todayProgress, setTodayProgress] = useState(65);
  
  // Behavioral hooks - track user engagement
  useEffect(() => {
    // Track daily login streak
    const lastLogin = localStorage.getItem('lastLogin');
    const today = new Date().toDateString();
    
    if (lastLogin !== today) {
      // New day - update streak
      const streakData = JSON.parse(localStorage.getItem('userStreak') || '{"count": 0, "lastDate": ""}');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (streakData.lastDate === yesterday.toDateString()) {
        streakData.count += 1;
      } else {
        streakData.count = 1; // Reset streak
      }
      
      streakData.lastDate = today;
      localStorage.setItem('userStreak', JSON.stringify(streakData));
      localStorage.setItem('lastLogin', today);
      setDailyStreak(streakData.count);
    }
  }, []);
  
  // Auto-update viewport for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      dispatch(uiActions.updateViewport({
        width: window.innerWidth,
        height: window.innerHeight
      }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  const handleWidgetChange = (widgetId) => {
    setActiveWidget(widgetId);
    // Micro-interaction feedback
    dispatch(uiActions.addNotification({
      type: 'info',
      title: 'Section Changed',
      message: `Switched to ${widgetId}`,
      autoClose: true,
      duration: 2000
    }));
  };

  const renderActiveWidget = () => {
    switch (activeWidget) {
      case 'overview':
        return <DashboardOverview streak={dailyStreak} progress={todayProgress} />;
      case 'content':
        return <ContentLibrary />;
      case 'analytics':
        return <Analytics />;
      case 'achievements':
        return <Achievements streak={dailyStreak} />;
      default:
        return <DashboardOverview streak={dailyStreak} progress={todayProgress} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="dashboard-redirect">
        <p>Please log in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className={`professional-dashboard theme-${theme.mode}`}>
      {/* Sidebar Navigation - Only visible to authenticated users */}
      {isAuthenticated && (
        <SidebarNavigation
          isOpen={sidebar.isOpen}
          isMobile={viewport.isMobile}
          activeSection={activeWidget}
          onSectionChange={handleWidgetChange}
          user={user}
          streak={dailyStreak}
        />
      )}
      
      {/* Main Content Area */}
      <main className={`dashboard-main ${sidebar.isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Top Progress Bar - Behavioral feedback */}
        <ProgressTracker 
          progress={todayProgress}
          streak={dailyStreak}
          goals={['Upload content', 'Check analytics', 'Update profile']}
        />
        
        {/* Quick Actions - Immediate value */}
        <QuickActions 
          onAction={(action) => {
            setTodayProgress(prev => Math.min(100, prev + 10));
            handleWidgetChange(action);
          }}
        />
        
        {/* Dynamic Widget Content */}
        <div className="dashboard-widget-container">
          {renderActiveWidget()}
        </div>
        
        {/* Floating Achievement Notifications */}
        {todayProgress === 100 && (
          <div className="achievement-popup">
            <h3>🎉 Daily Goals Complete!</h3>
            <p>You're building great habits!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfessionalDashboard;
