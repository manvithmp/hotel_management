import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdTableRestaurant,
  MdRestaurantMenu,
  MdOutlineListAlt,
} from 'react-icons/md';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <MdDashboard size={22} />, path: '/' },
    { name: 'Tables', icon: <MdTableRestaurant size={22} />, path: '/tables' },
    { name: 'Menu', icon: <MdRestaurantMenu size={22} />, path: '/menu' },
    { name: 'Order Line', icon: <MdOutlineListAlt size={22} />, path: '/order-line' },
  ];

  return (
    <div className="sidebar">
      {menuItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          className={({ isActive }) =>
            isActive ? 'sidebar-icon active' : 'sidebar-icon'
          }
        >
          {item.icon}
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;
