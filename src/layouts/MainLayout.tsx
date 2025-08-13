// src/components/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/header';
import Sidebar from '../components/sidebar/sidebar';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/footer/footer';
import { useSidebar } from '../contexts/SidebarContext';
import ChatButton from '../components/chat/ChatButton';
import './MainLayout.css';

const MainLayout: React.FC = () => {
    const { isOpen } = useSidebar();
    const { isAuthenticated } = useAuth();

    // Add a collapsed class to the layout when sidebar is closed
    const layoutClass = `app-layout${isOpen ? '' : ' sidebar-collapsed'}`;

    return (
        <div className={layoutClass}>
            <Header />
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