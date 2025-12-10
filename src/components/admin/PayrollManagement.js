import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './PayrollManagement.css';

function PayrollManagement() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emp_id: '',
    month: '',
    year: '',
    base_salary: '',
    allowances: '',
    deductions: '',
    status: 'pending',
    payment_date: ''
  });

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await api.get('/admin/payroll');
      setPayrolls(response.data);
    } catch (error) {
      console.error('Error fetching payroll:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error fetching payroll records',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
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
      if (editingPayroll) {
        await api.put(`/admin/payroll/${editingPayroll.id}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Payroll record updated successfully',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await api.post('/admin/payroll', formData);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Payroll record created successfully',
          confirmButtonColor: '#3085d6',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setShowModal(false);
      resetForm();
      fetchPayrolls();
    } catch (error) {
      console.error('Error saving payroll:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Error saving payroll record',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payroll) => {
    setEditingPayroll(payroll);
    setFormData({
      emp_id: payroll.emp_id,
      month: payroll.month,
      year: payroll.year,
      base_salary: payroll.base_salary,
      allowances: payroll.allowances || '',
      deductions: payroll.deductions || '',
      status: payroll.status,
      payment_date: payroll.payment_date ? payroll.payment_date.split('T')[0] : ''
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
      await api.delete(`/admin/payroll/${id}`);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Payroll record has been deleted.',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        showConfirmButton: false
      });
      fetchPayrolls();
    } catch (error) {
      console.error('Error deleting payroll:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error deleting payroll record',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      emp_id: '',
      month: '',
      year: '',
      base_salary: '',
      allowances: '',
      deductions: '',
      status: 'pending',
      payment_date: ''
    });
    setEditingPayroll(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || month;
  };

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
    <div className="payroll-management">
      <div className="section-header">
        <h2>Payroll Management</h2>
        <button onClick={openModal} className="btn-primary">+ Add Payroll</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Period</th>
              <th>Base Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Payment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(payroll => (
              <tr key={payroll.id}>
                <td>{payroll.first_name} {payroll.last_name} ({payroll.emp_id})</td>
                <td>{getMonthName(payroll.month)} {payroll.year}</td>
                <td>${parseFloat(payroll.base_salary).toLocaleString()}</td>
                <td>${parseFloat(payroll.allowances || 0).toLocaleString()}</td>
                <td>${parseFloat(payroll.deductions || 0).toLocaleString()}</td>
                <td><strong>${parseFloat(payroll.net_salary).toLocaleString()}</strong></td>
                <td>{getStatusBadge(payroll.status)}</td>
                <td>{payroll.payment_date ? new Date(payroll.payment_date).toLocaleDateString() : '-'}</td>
                <td>
                  <button onClick={() => handleEdit(payroll)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(payroll.id)} className="btn-delete">Delete</button>
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
              <h3>{editingPayroll ? 'Edit Payroll' : 'Add Payroll'}</h3>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee *</label>
                  <select
                    name="emp_id"
                    value={formData.emp_id}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingPayroll}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.emp_id} value={emp.emp_id}>
                        {emp.first_name} {emp.last_name} ({emp.emp_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Month *</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Month</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <option key={m} value={m}>{getMonthName(m)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year *</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    min="2020"
                    max="2100"
                  />
                </div>
                <div className="form-group">
                  <label>Base Salary *</label>
                  <input
                    type="number"
                    name="base_salary"
                    value={formData.base_salary}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Allowances</label>
                  <input
                    type="number"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Deductions</label>
                  <input
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingPayroll ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollManagement;

