import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../styles/nav-item.css';

export interface NavItemProps {
    to: string;
    icon: string;
    label: string;
    end?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({ to, icon, label, end }) => {
    const location = useLocation();
    const isActive = end ? location.pathname === to : location.pathname.startsWith(to);

    return (
        <NavLink 
            to={to} 
            className={({ isActive }) => `nav-item ${isActive ? ' active' : ''}`}
            end={end}
            data-label={label}
        >
            <span className={`nav-icon`}>
                <i className={`fas fa-${icon}`}></i>
            </span>
            <span className="nav-label">{label}</span>
            {isActive && <span className="nav-active-indicator" />}
        </NavLink>
    );
};