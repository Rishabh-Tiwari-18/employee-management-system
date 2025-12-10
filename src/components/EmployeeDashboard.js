import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import './EmployeeDashboard.css';

function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPayroll();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/employee/profile');
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayroll = async () => {
    try {
      const response = await api.get('/employee/payroll');
      setPayrolls(response.data);
    } catch (error) {
      console.error('Error fetching payroll:', error);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_photo', file);

      await api.put('/employee/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      fetchProfile();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Profile photo updated successfully',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error uploading profile photo',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!employee) {
    return <div className="loading">Employee not found</div>;
  }

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const profilePhotoUrl = employee.profile_photo 
    ? `${API_URL}${employee.profile_photo}` 
    : 'https://via.placeholder.com/150';

  return (
    <div className="employee-dashboard">
      <header className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {employee.first_name} {employee.last_name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-photo-section">
              <img src={profilePhotoUrl} alt="Profile" className="profile-photo" />
              <div className="photo-upload">
                <label htmlFor="photo-upload" className="upload-btn">
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <div className="profile-details">
              <h2>Personal Information</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Employee ID:</label>
                  <span>{employee.emp_id}</span>
                </div>
                <div className="detail-item">
                  <label>First Name:</label>
                  <span>{employee.first_name}</span>
                </div>
                <div className="detail-item">
                  <label>Last Name:</label>
                  <span>{employee.last_name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{employee.email}</span>
                </div>
                <div className="detail-item">
                  <label>Mobile No:</label>
                  <span>{employee.mobile_no || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Date of Birth:</label>
                  <span>{employee.dob ? new Date(employee.dob).toLocaleDateString() : '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Role:</label>
                  <span>{employee.role_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Salary:</label>
                  <span>{employee.salary ? `$${parseFloat(employee.salary).toLocaleString()}` : '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Date of Joining:</label>
                  <span>{employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="payroll-section">
          <h2>Payroll History</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Base Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  payrolls.map(payroll => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const getStatusBadge = (status) => {
                      const statuses = {
                        pending: { class: 'status-pending', text: 'Pending' },
                        paid: { class: 'status-paid', text: 'Paid' },
                        cancelled: { class: 'status-cancelled', text: 'Cancelled' }
                      };
                      const statusInfo = statuses[status] || statuses.pending;
                      return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
                    };
                    return (
                      <tr key={payroll.id}>
                        <td>{months[payroll.month - 1]}</td>
                        <td>{payroll.year}</td>
                        <td>${parseFloat(payroll.base_salary).toLocaleString()}</td>
                        <td>${parseFloat(payroll.allowances || 0).toLocaleString()}</td>
                        <td>${parseFloat(payroll.deductions || 0).toLocaleString()}</td>
                        <td><strong>${parseFloat(payroll.net_salary).toLocaleString()}</strong></td>
                        <td>{getStatusBadge(payroll.status)}</td>
                        <td>{payroll.payment_date ? new Date(payroll.payment_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmployeeDashboard;

