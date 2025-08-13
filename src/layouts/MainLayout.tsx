// src/layouts/MainLayout.tsx - Enhanced with Redux State Management
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/header';
import Sidebar from '../components/sidebar/sidebar';
import Footer from '../components/footer/footer';
import ChatButton from '../components/chat/ChatButton';
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
            {/* 🔐 Sidebar only shows for authenticated users - Enhanced with Redux */}
            {isAuthenticated && <Sidebar />}
            <main className="content-wrapper">
                <Outlet />
            </main>
            <Footer />
            <ChatButton websiteId={process.env.REACT_APP_BREVO_WEBSITE_ID}/>
        </div>
    );
};

export default MainLayout;