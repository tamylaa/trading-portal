import React from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import './header.css';

const Header: React.FC = () => {
    const { isOpen, toggleSidebar } = useSidebar();

    return (
        <header className="site-header">
            <div className="header-content">
                <div className="header-left">
                    {/* Sidebar Toggle - prominent contrasting color */}
                    <button 
                        className={`sidebar-toggle ${isOpen ? 'active' : ''}`}
                        onClick={toggleSidebar}
                        aria-label="Toggle Sidebar"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <Link to="/" className="logo">
                        <img 
                            src={`${process.env.PUBLIC_URL}/assets/logos/logo.png`} 
                            alt="Tamyla Trading" 
                        />
                    </Link>
                </div>
                <div className="header-center">
                    <span className="header-tagline">Gateway to Global Trading</span>
                </div>
            </div>
        </header>
    );
};

export default Header;