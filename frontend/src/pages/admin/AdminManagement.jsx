import { useState, useEffect } from 'react';
import { HiUserAdd, HiTrash, HiShieldCheck, HiCheckCircle, HiPencil } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminManagement = () => {
  const { user: currentUser, fetchUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMakePrimaryModal, setShowMakePrimaryModal] = useState(false);
  const [selectedAdminForPrimary, setSelectedAdminForPrimary] = useState(null);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/admin/admins');
      const list = response.data.data || [];
      // Filter out system admin accounts (emails containing .system@ or .system.)
      const visibleAdmins = list.filter((admin) => !/\.system[@.]/i.test(admin?.email || ''));
      setAdmins(visibleAdmins);
    } catch (error) {
      toast.error('Failed to fetch admins');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEdit = (admin) => {
    setSelectedAdminForEdit(admin);
    setEditFormData({
      name: admin.name,
      phone: admin.phone || '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (editFormData.newPassword && editFormData.newPassword !== editFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (editFormData.newPassword && editFormData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const updateData = {
        name: editFormData.name,
        phone: editFormData.phone
      };

      if (editFormData.newPassword) {
        updateData.password = editFormData.newPassword;
      }

      await api.put(`/admin/admins/${selectedAdminForEdit._id}`, updateData);
      toast.success('Admin updated successfully');
      setShowEditModal(false);
      setSelectedAdminForEdit(null);
      setEditFormData({ name: '', phone: '', newPassword: '', confirmPassword: '' });
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await api.post('/admin/admins', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      toast.success('Admin created successfully');
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to remove this admin?')) return;

    try {
      await api.delete(`/admin/admins/${adminId}`);
      toast.success('Admin removed successfully');
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove admin');
    }
  };

  const isSystemAdmin = () => {
    return currentUser?.email && /\.system[@.]/i.test(currentUser.email);
  };

  const canManageAdmins = () => {
    return currentUser?.email === 'vh@iiitdmj.ac.in' || 
           currentUser?.isPrimaryAdmin || 
           isSystemAdmin();
  };

  const handleMakePrimary = async () => {
    if (!selectedAdminForPrimary) return;

    try {
      await api.put(`/admin/admins/${selectedAdminForPrimary._id}/make-primary`);
      toast.success('Primary admin role transferred successfully');
      setShowMakePrimaryModal(false);
      setSelectedAdminForPrimary(null);
      fetchAdmins();
      // Refresh user data to update isPrimaryAdmin flag
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to transfer primary admin role');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-poppins text-3xl font-bold text-slate-primary mb-2">
              Admin Management
            </h1>
            <p className="text-gray-600">Manage admin users and permissions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <HiUserAdd className="w-5 h-5" />
            Add Admin
          </button>
        </div>

        {/* Admins List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {admins.map((admin) => (
              <div key={admin._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <HiShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-primary">{admin.name}</h3>
                      <p className="text-sm text-gray-500">Administrator</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {admin.email !== 'vh@iiitdmj.ac.in' && canManageAdmins() && (
                      <button
                        onClick={() => handleEdit(admin)}
                        className="text-blue-500 hover:text-blue-700 p-2"
                        title="Edit admin"
                      >
                        <HiPencil className="w-5 h-5" />
                      </button>
                    )}
                    {admin.email !== 'vh@iiitdmj.ac.in' && (canManageAdmins()) && (
                      <button
                        onClick={() => {
                          setSelectedAdminForPrimary(admin);
                          setShowMakePrimaryModal(true);
                        }}
                        className="text-green-500 hover:text-green-700 p-2"
                        title="Make primary admin"
                      >
                        <HiCheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    {admin.email !== 'vh@iiitdmj.ac.in' && canManageAdmins() && (
                      <button
                        onClick={() => handleDelete(admin._id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Remove admin"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {admin.email}
                  </p>
                  {admin.phone && (
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span> {admin.phone}
                    </p>
                  )}
                </div>
                {admin.email === 'vh@iiitdmj.ac.in' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
                      Primary Admin
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Make Primary Admin Modal */}
        {showMakePrimaryModal && selectedAdminForPrimary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="font-poppins text-2xl font-bold text-slate-primary mb-4">
                Transfer Primary Admin Role
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> You will no longer be the primary admin after this action. Make sure you trust this person with administrative responsibilities.
                </p>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 mb-3">
                  Are you sure you want to make <strong>{selectedAdminForPrimary.name}</strong> ({selectedAdminForPrimary.email}) the primary admin?
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Selected Admin:</span>
                  </p>
                  <p className="text-sm font-semibold text-slate-primary">{selectedAdminForPrimary.name}</p>
                  <p className="text-sm text-gray-600">{selectedAdminForPrimary.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleMakePrimary}
                  className="btn-primary flex-1"
                >
                  Transfer Role
                </button>
                <button
                  onClick={() => {
                    setShowMakePrimaryModal(false);
                    setSelectedAdminForPrimary(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Admin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="font-poppins text-2xl font-bold text-slate-primary mb-6">
                Add New Admin
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Create Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Admin Modal */}
        {showEditModal && selectedAdminForEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="font-poppins text-2xl font-bold text-slate-primary mb-6">
                Edit Admin
              </h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedAdminForEdit.email}
                    disabled
                    className="input-field bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password (Leave empty to keep current)
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={editFormData.newPassword}
                    onChange={handleEditInputChange}
                    className="input-field"
                    minLength={6}
                  />
                </div>
                {editFormData.newPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={editFormData.confirmPassword}
                      onChange={handleEditInputChange}
                      className="input-field"
                      required
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Update Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAdminForEdit(null);
                      setEditFormData({ name: '', phone: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
