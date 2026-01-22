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
                        <picture>
                            <source type="image/avif" srcSet={`${process.env.PUBLIC_URL}/assets/logos/logo.avif`} />
                            <source type="image/webp" srcSet={`${process.env.PUBLIC_URL}/assets/logos/logo.webp`} />
                            <img src={`${process.env.PUBLIC_URL}/assets/logos/logo.png`} alt="Tamyla Trading" />
                        </picture>
                    </Link>
                </div>
                <div className="header-center">
                    <span className="header-tagline">Gateway to Global Trading</span>
                </div>
                <nav className="header-nav">
                    <Link
                        to="/login"
                        className="header-story-link login-link"
                        aria-label="Login"
                    >
                        <span role="img" aria-label="lock" style={{marginRight: '0.5em'}}>🔒</span>
                        <span>Login</span>
                    </Link>
                    <Link
                        to="/stories/github-cloudflare"
                        className="header-story-link"
                        aria-label="Featured Story"
                    >
                        <span role="img" aria-label="book" style={{marginRight: '0.5em'}}>📖</span>
                        <span>Story</span>
                    </Link>
                    <Link
                        to="/stories"
                        className="header-story-link header-story-link-alt"
                        aria-label="All Stories & Build Journeys"
                    >
                        <span role="img" aria-label="sparkles" style={{marginRight: '0.5em'}}>✨</span>
                        <span>All Stories</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;