import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './RoleManagement.css';

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role_name: '',
    description: ''
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/admin/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error fetching roles',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRole) {
        await api.put(`/admin/roles/${editingRole.id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Role updated successfully',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await api.post('/admin/roles', formData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Role created successfully',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setShowModal(false);
      resetForm();
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Error saving role',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      role_name: role.role_name,
      description: role.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
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
      await api.delete(`/admin/roles/${id}`);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Role has been deleted.',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        showConfirmButton: false
      });
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error deleting role',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      role_name: '',
      description: ''
    });
    setEditingRole(null);
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
    <div className="role-management">
      <div className="section-header">
        <h2>Role Management</h2>
        <button onClick={openModal} className="btn-primary">+ Add Role</button>
      </div>

      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className="role-card">
            <div className="role-header">
              <h3>{role.role_name}</h3>
              <div className="role-actions">
                <button onClick={() => handleEdit(role)} className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(role.id)} className="btn-delete">Delete</button>
              </div>
            </div>
            {role.description && (
              <p className="role-description">{role.description}</p>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRole ? 'Edit Role' : 'Add Role'}</h3>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  name="role_name"
                  value={formData.role_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Manager, Developer"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Role description..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingRole ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagement;

