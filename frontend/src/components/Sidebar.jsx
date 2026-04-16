import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, CreditCard, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="sidebar">
      <h2>{isAdmin ? 'CA Admin Panel' : 'CA Client Portal'}</h2>
      
      <div style={{ flex: 1 }}>
        <NavLink to={isAdmin ? '/admin' : '/client'} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        {isAdmin && (
          <NavLink to="/admin/clients" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Users size={20} />
            <span>Clients</span>
          </NavLink>
        )}

        <NavLink to={isAdmin ? '/admin/documents' : '/client/documents'} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <FileText size={20} />
          <span>Documents</span>
        </NavLink>

        <NavLink to={isAdmin ? '/admin/invoices' : '/client/invoices'} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <CreditCard size={20} />
          <span>Invoices</span>
        </NavLink>
      </div>

      <button onClick={logout} className="logout-btn">
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
