import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './EmployeeManagement.css';

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emp_id: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile_no: '',
    dob: '',
    role_id: '',
    salary: '',
    date_of_joining: '',
    password: '',
    profile_photo: null
  });

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error fetching employees';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/admin/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_photo') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append required fields
      formDataToSend.append('emp_id', formData.emp_id);
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('email', formData.email);
      
      // Append optional fields only if they have values
      if (formData.mobile_no) formDataToSend.append('mobile_no', formData.mobile_no);
      if (formData.dob) formDataToSend.append('dob', formData.dob);
      if (formData.role_id) formDataToSend.append('role_id', formData.role_id);
      if (formData.salary) formDataToSend.append('salary', formData.salary);
      if (formData.date_of_joining) formDataToSend.append('date_of_joining', formData.date_of_joining);
      
      // Append password only when creating new employee (required field)
      if (!editingEmployee) {
        if (!formData.password) {
          Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Password is required for new employees',
            confirmButtonColor: '#3085d6'
          });
          setLoading(false);
          return;
        }
        formDataToSend.append('password', formData.password);
      }
      
      // Append profile photo if present
      if (formData.profile_photo) {
        formDataToSend.append('profile_photo', formData.profile_photo);
      }

      if (editingEmployee) {
        await api.put(`/admin/employees/${editingEmployee.emp_id}`, formDataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Employee updated successfully',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await api.post('/admin/employees', formDataToSend);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Employee created successfully',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error saving employee';
      console.error('Full error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      emp_id: employee.emp_id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      mobile_no: employee.mobile_no || '',
      dob: employee.dob ? employee.dob.split('T')[0] : '',
      role_id: employee.role_id || '',
      salary: employee.salary || '',
      date_of_joining: employee.date_of_joining ? employee.date_of_joining.split('T')[0] : '',
      password: '',
      profile_photo: null
    });
    setShowModal(true);
  };

  const handleDelete = async (empId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await api.delete(`/admin/employees/${empId}`);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Employee has been deleted.',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        showConfirmButton: false
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error deleting employee',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      emp_id: '',
      first_name: '',
      last_name: '',
      email: '',
      mobile_no: '',
      dob: '',
      role_id: '',
      salary: '',
      date_of_joining: '',
      password: '',
      profile_photo: null
    });
    setEditingEmployee(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="employee-management">
      <div className="section-header">
        <h2>Employee Management</h2>
        <button onClick={openModal} className="btn-primary">+ Add Employee</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.emp_id}</td>
                <td>{emp.first_name} {emp.last_name}</td>
                <td>{emp.email}</td>
                <td>{emp.mobile_no || '-'}</td>
                <td>{emp.role_name || '-'}</td>
                <td>{emp.salary ? `$${parseFloat(emp.salary).toLocaleString()}` : '-'}</td>
                <td>
                  <button onClick={() => handleEdit(emp)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(emp.emp_id)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h3>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    name="emp_id"
                    value={formData.emp_id}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingEmployee}
                  />
                </div>
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile No</label>
                  <input
                    type="tel"
                    name="mobile_no"
                    value={formData.mobile_no}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.role_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Joining</label>
                  <input
                    type="date"
                    name="date_of_joining"
                    value={formData.date_of_joining}
                    onChange={handleInputChange}
                  />
                </div>
                {!editingEmployee && (
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingEmployee}
                    />
                  </div>
                )}
                <div className="form-group full-width">
                  <label>Profile Photo</label>
                  <input
                    type="file"
                    name="profile_photo"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingEmployee ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;

