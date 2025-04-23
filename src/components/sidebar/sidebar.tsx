import React, { useEffect } from 'react';
import { useSidebar } from '../../contexts/SidebarContext';
import { SidebarSection } from './SidebarSection';
import { SidebarFooter } from './SidebarFooter';
import './sidebar.css';

const Sidebar: React.FC = () => {
    const { isOpen, toggleSidebar } = useSidebar();

    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Centralized nav config
    const mainMenuItems = [
        { to: '/', icon: 'home', label: 'Home', end: true },
        { to: '/dashboard', icon: 'chart-line', label: 'Dashboard' },
        { to: '/trades', icon: 'exchange-alt', label: 'Trades' }
    ];

    const accountItems = [
        { to: '/profile', icon: 'user', label: 'Profile' },
        { to: '/settings', icon: 'cog', label: 'Settings' }
    ];

    return (
        <>
            {(isMobile && isOpen) && (
                <div className="sidebar-overlay" onClick={toggleSidebar} aria-label="Close sidebar overlay" />
            )}
            <aside 
                className={`sidebar${isMobile ? (isOpen ? ' open' : '') : (isOpen ? '' : ' sidebar-collapsed')}`}
                role="navigation"
                aria-label="Main sidebar"
                aria-expanded={isOpen}
            >
                {/* SidebarHeader removed for unified header/sidebar experience */}
                <div className="sidebar-content">
                    <SidebarSection title="Main Menu" items={mainMenuItems} />
                    <hr className="sidebar-divider" />
                    <SidebarSection title="Account" items={accountItems} />
                </div>
                <SidebarFooter avatar="TP" name="Jane Doe" role="Trader" />
            </aside>
        </>
    );
};

export default Sidebar;