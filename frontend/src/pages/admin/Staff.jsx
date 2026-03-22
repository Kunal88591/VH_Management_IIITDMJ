import { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash,
  HiX,
  HiUserCircle,
  HiPhone,
  HiMail,
  HiBadgeCheck
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Housekeeping',
    shift: 'Morning',
    salary: '',
    joiningDate: '',
    address: '',
    emergencyContact: '',
    biometricId: ''
  });

  const roles = ['Housekeeping', 'Front Desk', 'Maintenance', 'Security', 'Kitchen', 'Manager', 'Supervisor'];
  const shifts = ['Morning', 'Evening', 'Night'];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await staffAPI.getAll();
      setStaffList(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await staffAPI.update(editingStaff._id, formData);
        toast.success('Staff updated successfully');
      } else {
        await staffAPI.create(formData);
        toast.success('Staff added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save staff');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await staffAPI.delete(id);
      toast.success('Staff deleted successfully');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete staff');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await staffAPI.toggleStatus(id);
      toast.success(`Staff ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email || '',
      phone: staff.phone,
      role: staff.role,
      shift: staff.shift,
      salary: staff.salary || '',
      joiningDate: staff.joiningDate ? staff.joiningDate.split('T')[0] : '',
      address: staff.address || '',
      emergencyContact: staff.emergencyContact || '',
      biometricId: staff.biometricId || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Housekeeping',
      shift: 'Morning',
      salary: '',
      joiningDate: '',
      address: '',
      emergencyContact: '',
      biometricId: ''
    });
  };

  const getShiftBadge = (shift) => {
    const badges = {
      'Morning': 'bg-yellow-100 text-yellow-700',
      'Evening': 'bg-orange-100 text-orange-700',
      'Night': 'bg-indigo-100 text-indigo-700',
    };
    return badges[shift] || 'bg-gray-100 text-gray-700';
  };

  const getRoleColor = (role) => {
    const colors = {
      'Manager': 'text-purple-600',
      'Supervisor': 'text-blue-600',
      'Front Desk': 'text-green-600',
      'Housekeeping': 'text-teal-600',
      'Kitchen': 'text-orange-600',
      'Security': 'text-red-600',
      'Maintenance': 'text-gray-600',
    };
    return colors[role] || 'text-gray-600';
  };

  // Stats
  const activeStaff = staffList.filter(s => s.isActive).length;
  const staffByShift = {
    Morning: staffList.filter(s => s.shift === 'Morning').length,
    Evening: staffList.filter(s => s.shift === 'Evening').length,
    Night: staffList.filter(s => s.shift === 'Night').length,
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-poppins text-2xl font-semibold text-slate-primary">
          Staff Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card">
          <p className="text-gray-500 text-sm">Total Staff</p>
          <p className="text-2xl font-bold text-slate-primary">{staffList.length}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-green-600 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-700">{activeStaff}</p>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-yellow-600 text-sm">Morning Shift</p>
          <p className="text-2xl font-bold text-yellow-700">{staffByShift.Morning}</p>
        </div>
        <div className="card bg-orange-50 border-orange-200">
          <p className="text-orange-600 text-sm">Evening Shift</p>
          <p className="text-2xl font-bold text-orange-700">{staffByShift.Evening}</p>
        </div>
        <div className="card bg-indigo-50 border-indigo-200">
          <p className="text-indigo-600 text-sm">Night Shift</p>
          <p className="text-2xl font-bold text-indigo-700">{staffByShift.Night}</p>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : staffList.length === 0 ? (
        <div className="card text-center py-12">
          <HiUserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No staff members found. Add your first staff!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((staff) => (
            <div key={staff._id} className={`card hover:shadow-lg transition-shadow ${!staff.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center">
                  <HiUserCircle className="w-10 h-10 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-primary">{staff.name}</h3>
                      <p className={`text-sm font-medium ${getRoleColor(staff.role)}`}>{staff.role}</p>
                    </div>
                    <span className={`badge ${staff.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiPhone className="w-4 h-4" />
                  {staff.phone}
                </div>
                {staff.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HiMail className="w-4 h-4" />
                    {staff.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className={`badge ${getShiftBadge(staff.shift)}`}>
                    {staff.shift} Shift
                  </span>
                  {staff.biometricId && (
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <HiBadgeCheck className="w-4 h-4 text-green-500" />
                      Biometric: {staff.biometricId}
                    </span>
                  )}
                </div>
              </div>

              {staff.salary && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-500">
                    Salary: <span className="font-semibold text-slate-primary">₹{staff.salary.toLocaleString()}/month</span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-3 border-t">
                <button
                  onClick={() => openEditModal(staff)}
                  className="flex-1 btn-outline py-2 text-sm flex items-center justify-center gap-1"
                >
                  <HiPencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleStatusToggle(staff._id, staff.isActive)}
                  className={`flex-1 py-2 text-sm rounded-md ${
                    staff.isActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {staff.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(staff._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete staff"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="font-poppins font-semibold text-lg">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  >
                    {shifts.map((shift) => (
                      <option key={shift} value={shift}>{shift}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary (₹/month)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="Enter monthly salary"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biometric ID
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.biometricId}
                    onChange={(e) => setFormData({ ...formData, biometricId: e.target.value })}
                    placeholder="e.g., BIO001"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    rows={2}
                    className="input-field"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Name - Phone Number"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
