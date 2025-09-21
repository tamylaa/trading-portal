// Professional Dashboard with Behavioral Psychology UX
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { uiActions } from '../../store';
import { EnhancedTradingDashboard } from '../enhanced/EnhancedTradingDashboard';
import PageLayout from '../common/PageLayout';
import './ProfessionalDashboard.css';

// Dashboard Widgets
import DashboardOverview from './components/DashboardOverview';
import ProgressTracker from './components/ProgressTracker';
import QuickActions from './components/QuickActions';

import { Analytics, Achievements } from './components/WidgetComponents';
import DashboardWidget from './DashboardWidget';
import ContentAccess from '../../pages/ContentAccess';
import { EmailBlasterTest } from '../EmailBlasterTest';

const ProfessionalDashboard = () => {
  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  
  // Enhanced sidebar integration
  const { isOpen: sidebarOpen } = useSidebar();
  const theme = useAppSelector(state => state.ui.theme);
  
  // Local state for dashboard widgets
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
        // Example: Wrap ContentUpload in DashboardWidget for unified dashboard style
        return (
          <DashboardWidget title="Content Upload">
            <ContentAccess />
          </DashboardWidget>
        );
      case 'testing':
        return (
          <DashboardWidget title="Enhanced Component Testing">
            <EmailBlasterTest />
          </DashboardWidget>
        );
      case 'trading':
        return (
          <DashboardWidget title="Enhanced Trading Dashboard">
            <EnhancedTradingDashboard 
              symbols={['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']}
              showAdvancedFeatures={true}
            />
          </DashboardWidget>
        );
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
    <PageLayout title="Dashboard" subtitle="Welcome back to your trading portal">
      <div className={`professional-dashboard theme-${theme.mode}`}>
        {/* Main Content Area - Uses professional sidebar from MainLayout */}
        <main className={`dashboard-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
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
    </PageLayout>
  );
};

export default ProfessionalDashboard;
