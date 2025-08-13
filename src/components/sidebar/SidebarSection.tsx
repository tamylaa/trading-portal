import React from 'react';
import { NavItemProps } from './components/NavItem';
import { NavItem } from './components/NavItem';

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
