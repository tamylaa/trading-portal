import React from 'react';
import { NavItemProps } from './components/NavItem';
import { NavItem } from './components/NavItem';
import './styles/nav-item.css';

interface SidebarSectionProps {
  title: string;
  items: NavItemProps[];
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({ title, items }) => {
  return (
    <div className="sidebar-section">
      <div className="section-header">{title}</div>
      {items.map(item => (
        <NavItem key={item.to} {...item} />
      ))}
    </div>
  );
};
