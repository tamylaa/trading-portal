// src/layouts/MainLayout.tsx - Enhanced with Professional Sidebar
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import ChatButton from '../components/chat/ChatButton';
import SidebarNavigation from '../components/dashboard/components/SidebarNavigation';
import { useAuth } from '../store/hooks';
import { useSidebar } from '../contexts/SidebarContext';
import './MainLayout.css';

const MainLayout: React.FC = () => {
    const { isAuthenticated, user } = useAuth(); // Get user data
    const { isOpen } = useSidebar(); // Use SidebarContext instead of Redux
    const location = useLocation();

    // DEBUG: Check if MainLayout is working
    console.log('🔍 MainLayout rendering:', { isAuthenticated, user, isOpen, pathname: location.pathname });
    
    // Define landing pages that should NEVER show sidebar
    const landingPages = ['/', '/about', '/contact', '/stories'];
    const isLandingPage = landingPages.includes(location.pathname) || location.pathname.startsWith('/stories/');
    
    // Check if we have auth token in localStorage as fallback
    const hasToken = localStorage.getItem('auth_token') || localStorage.getItem('token');
    
    // CRITICAL FIX: Never show sidebar on landing pages, regardless of auth status
    const shouldShowSidebar = !isLandingPage && (isAuthenticated || hasToken || user);
    
    console.log('🔍 Auth check:', { 
        isAuthenticated, 
        hasToken: !!hasToken, 
        hasUser: !!user, 
        isLandingPage,
        shouldShowSidebar 
    });

    // Add a collapsed class to the layout and sidebar when sidebar is closed
    const layoutClass = `app-layout ${shouldShowSidebar ? 'has-sidebar' : 'no-sidebar'} ${shouldShowSidebar && !isOpen ? 'sidebar-collapsed' : ''}`;
    const sidebarClass = `sidebar${isOpen ? '' : ' sidebar-collapsed'}`;

    return (
        <div className={layoutClass}>
            <Header />
            {/* 510 Professional Sidebar - Unified navigation system */}
            {shouldShowSidebar && (
                <div className={sidebarClass}>
                    <SidebarNavigation 
                        activeSection="dashboard"
                        onSectionChange={() => {}} // MainLayout doesn't need to handle section changes
                        user={user || { name: 'User' }} // Pass actual user data
                        streak={7} // This could come from user data or localStorage
                    />
                </div>
            )}
            <main className="content-wrapper">
                <Outlet />
            </main>
            <Footer />
            <ChatButton websiteId={process.env.REACT_APP_BREVO_WEBSITE_ID}/>
        </div>
    );
};

export default MainLayout;