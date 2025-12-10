import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EmployeeManagement from './admin/EmployeeManagement';
import PayrollManagement from './admin/PayrollManagement';
import RoleManagement from './admin/RoleManagement';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('employees');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === 'employees' ? 'active' : ''}
          onClick={() => setActiveTab('employees')}
        >
          Employees
        </button>
        <button
          className={activeTab === 'payroll' ? 'active' : ''}
          onClick={() => setActiveTab('payroll')}
        >
          Payroll
        </button>
        <button
          className={activeTab === 'roles' ? 'active' : ''}
          onClick={() => setActiveTab('roles')}
        >
          Roles
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'employees' && <EmployeeManagement />}
        {activeTab === 'payroll' && <PayrollManagement />}
        {activeTab === 'roles' && <RoleManagement />}
      </main>
    </div>
  );
}

export default AdminDashboard;

