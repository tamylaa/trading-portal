// src/components/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header/header';
import Sidebar from '../components/sidebar/sidebar';
import Footer from '../components/footer/footer';
import { useSidebar } from '../contexts/SidebarContext';
import './MainLayout.css';

const MainLayout: React.FC = () => {
    const { isOpen } = useSidebar();

    // Add a collapsed class to the layout when sidebar is closed
    const layoutClass = `app-layout${isOpen ? '' : ' sidebar-collapsed'}`;

    return (
        <div className={layoutClass}>
            <Header />
            <Sidebar />
            <main className="content-wrapper">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;