// src/layouts/MainLayout.tsx - Enhanced with Professional Sidebar
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import ChatButton from '../components/chat/ChatButton';
import SidebarNavigation from '../components/dashboard/components/SidebarNavigation';
import { useAuth, useSidebar } from '../store/hooks';
import './MainLayout.css';

const MainLayout: React.FC = () => {
    // 🚀 Enhanced Redux hooks with better performance and features
    const { isAuthenticated } = useAuth();
    const { isOpen } = useSidebar();

    // Add a collapsed class to the layout when sidebar is closed
    const layoutClass = `app-layout${isOpen ? '' : ' sidebar-collapsed'}`;

    return (
        <div className={layoutClass}>
            <Header />
            {/* 🔐 Professional Sidebar - Unified navigation system */}
            {isAuthenticated && (
                <SidebarNavigation 
                    activeSection="dashboard"
                    onSectionChange={() => {}} // MainLayout doesn't need to handle section changes
                    user={{ name: 'Trading User' }} // This will come from auth context
                    streak={7} // This will come from user data
                />
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