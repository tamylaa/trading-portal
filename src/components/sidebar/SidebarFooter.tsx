import React from 'react';
import './sidebar.css';

interface SidebarFooterProps {
  avatar: string;
  name: string;
  role: string;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ avatar, name, role }) => (
  <div className="sidebar-user">
    <span className="sidebar-user-avatar">{avatar}</span>
    <span className="sidebar-user-info">
      <span className="sidebar-user-name">{name}</span>
      <span className="sidebar-user-role">{role}</span>
    </span>
  </div>
);
