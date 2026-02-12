import { useState, useEffect } from 'react';
import { attendanceAPI, staffAPI } from '../../services/api';
import {
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiDownload,
  HiCalendar,
  HiUserGroup,
  HiLogin,
  HiLogout
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markData, setMarkData] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '',
    checkOut: ''
  });
  const [selectedMethod, setSelectedMethod] = useState('Manual'); // For quick check-in/out

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedStaff]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Prepare query params
      const params = {};

      // Add date filtering
      if (selectedDate) {
        params.startDate = selectedDate;
        params.endDate = selectedDate;
      }

      // Add staff filter
      if (selectedStaff) {
        params.staffId = selectedStaff;
      }

      const [attendanceRes, staffRes, todayRes] = await Promise.all([
        attendanceAPI.getAll(params).catch(() => ({ data: { data: [] } })),
        staffAPI.getAll().catch(() => ({ data: { data: [] } })),
        attendanceAPI.getToday().catch(() => ({ data: { data: { records: [] } } }))
      ]);

      setAttendanceList(attendanceRes.data.data || []);
      setStaffList((staffRes.data.data || []).filter(s => s.isActive !== false));
      setTodayAttendance(todayRes.data.data?.records || []);
    } catch (error) {
      console.error('Fetch attendance error:', error);
      setAttendanceList([]);
      setStaffList([]);
      setTodayAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (staffId) => {
    try {
      await attendanceAPI.checkIn({ staffId, method: selectedMethod });
      toast.success(`Check-in recorded (${selectedMethod})`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (staffId) => {
    try {
      await attendanceAPI.checkOut({ staffId, method: selectedMethod });
      toast.success(`Check-out recorded (${selectedMethod})`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const handleManualMark = async () => {
    try {
      // Transform the data to match backend expectations
      const payload = {
        staffId: markData.staffId,
        date: markData.date,
        status: markData.status,
      };

      // Add check-in/out times if present
      if (markData.checkIn) {
        payload.checkInTime = `${markData.date}T${markData.checkIn}:00`;
      }
      if (markData.checkOut) {
        payload.checkOutTime = `${markData.date}T${markData.checkOut}:00`;
      }

      await attendanceAPI.markManual(payload);
      toast.success('Attendance marked successfully');
      setShowMarkModal(false);
      setMarkData({
        staffId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        checkIn: '',
        checkOut: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const downloadReport = async () => {
    try {
      // Get the month range for the selected date
      const startDate = new Date(selectedDate);
      startDate.setDate(1);
      const endDate = new Date(selectedDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);

      // Fetch detailed attendance records (not aggregated report)
      const res = await attendanceAPI.getAll({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...(selectedStaff && { staffId: selectedStaff }),
        limit: 1000 // Get all records for the month
      });

      const records = res.data.data || [];

      if (records.length === 0) {
        toast.error('No attendance records found for this period');
        return;
      }

      // Create comprehensive CSV with all fields including Staff ID and timings
      const headers = [
        'Date',
        'Staff ID',
        'Staff Name',
        'Role',
        'Shift',
        'Status',
        'Check-In Time',
        'Check-In Method',
        'Check-Out Time',
        'Check-Out Method',
        'Working Hours',
        'Overtime',
        'Notes',
        'Marked By'
      ];

      const rows = records.map(a => {
        // Format check-in time
        let checkInTime = '-';
        let checkInMethod = '-';
        if (a.checkIn?.time) {
          checkInTime = new Date(a.checkIn.time).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
          checkInMethod = a.checkIn.method || 'Manual';
        }

        // Format check-out time
        let checkOutTime = '-';
        let checkOutMethod = '-';
        if (a.checkOut?.time) {
          checkOutTime = new Date(a.checkOut.time).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
          checkOutMethod = a.checkOut.method || 'Manual';
        }

        return [
          new Date(a.date).toLocaleDateString('en-IN'),
          a.staff?.employeeId || 'N/A',
          a.staff?.name || 'N/A',
          a.staff?.role || 'N/A',
          a.staff?.shift || 'N/A',
          a.status || '-',
          checkInTime,
          checkInMethod,
          checkOutTime,
          checkOutMethod,
          a.workingHours ? `${a.workingHours.toFixed(2)}` : '0',
          a.overtime ? `${a.overtime.toFixed(2)}` : '0',
          a.notes || '-',
          a.markedBy?.name || 'System'
        ];
      });

      // Sort by date descending
      rows.sort((a, b) => new Date(b[0].split('/').reverse().join('-')) - new Date(a[0].split('/').reverse().join('-')));

      // Escape CSV fields properly
      const escapeCSV = (field) => {
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csv = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
      
      // Add BOM for Excel UTF-8 compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Better filename with month-year
      const monthYear = startDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      link.download = `Attendance-Report-${monthYear.replace(' ', '-')}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded ${records.length} attendance records`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Present': 'badge-success',
      'Absent': 'badge-danger',
      'Late': 'badge-pending',
      'Half Day': 'bg-orange-100 text-orange-700',
      'On Leave': 'bg-blue-100 text-blue-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getStaffAttendanceStatus = (staffId) => {
    return todayAttendance.find(a => a.staff?._id === staffId);
  };

  // Stats
  const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
  const absentToday = staffList.length - todayAttendance.length;
  const lateToday = todayAttendance.filter(a => a.status === 'Late').length;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="font-poppins text-2xl font-semibold text-slate-primary">
          Attendance Management
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMarkModal(true)}
            className="btn-outline flex items-center gap-2"
          >
            <HiCheckCircle className="w-5 h-5" />
            Mark Attendance
          </button>
          <button
            onClick={downloadReport}
            className="btn-primary flex items-center gap-2"
          >
            <HiDownload className="w-5 h-5" />
            Download Report
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-gray-500 text-sm">Total Staff</p>
          <p className="text-2xl font-bold text-slate-primary">{staffList.length}</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-green-600 text-sm">Present Today</p>
          <p className="text-2xl font-bold text-green-700">{presentToday}</p>
        </div>
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600 text-sm">Absent Today</p>
          <p className="text-2xl font-bold text-red-700">{absentToday}</p>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-yellow-600 text-sm">Late Today</p>
          <p className="text-2xl font-bold text-yellow-700">{lateToday}</p>
        </div>
      </div>

      {/* Quick Check-In/Out */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-primary flex items-center gap-2">
            <HiClock className="w-5 h-5" />
            Quick Check-In/Out (Today)
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Method:</span>
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setSelectedMethod('Manual')}
                className={`px-3 py-1 text-sm ${selectedMethod === 'Manual' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Manual
              </button>
              <button
                onClick={() => setSelectedMethod('Biometric')}
                className={`px-3 py-1 text-sm ${selectedMethod === 'Biometric' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                🔒 Biometric
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((staff) => {
            const attendance = getStaffAttendanceStatus(staff._id);
            const hasCheckedIn = !!(attendance?.checkIn?.time || (attendance?.checkIn && typeof attendance.checkIn !== 'object'));
            const hasCheckedOut = !!(attendance?.checkOut?.time || (attendance?.checkOut && typeof attendance.checkOut !== 'object' && attendance.checkOut));

            return (
              <div
                key={staff._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-gray-200 px-1.5 py-0.5 rounded">{staff.employeeId}</span>
                    <p className="font-medium">{staff.name}</p>
                  </div>
                  <p className="text-sm text-gray-500">{staff.role} - {staff.shift}</p>
                  {hasCheckedIn && (
                    <div className="text-xs mt-1 space-y-1">
                      <p className="text-green-600 flex items-center gap-1">
                        <span className="font-semibold">In:</span> {new Date(attendance.checkIn?.time || attendance.checkIn).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {attendance.checkIn?.method && <span className="badge bg-green-100 text-green-700 text-xs px-1">{attendance.checkIn.method}</span>}
                      </p>
                      {hasCheckedOut && (
                        <p className="text-blue-600 flex items-center gap-1">
                          <span className="font-semibold">Out:</span> {new Date(attendance.checkOut?.time || attendance.checkOut).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {attendance.checkOut?.method && <span className="badge bg-blue-100 text-blue-700 text-xs px-1">{attendance.checkOut.method}</span>}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {!hasCheckedIn && (
                    <button
                      onClick={() => handleCheckIn(staff._id)}
                      className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                      title="Check In"
                    >
                      <HiLogin className="w-5 h-5" />
                    </button>
                  )}
                  {hasCheckedIn && !hasCheckedOut && (
                    <button
                      onClick={() => handleCheckOut(staff._id)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      title="Check Out"
                    >
                      <HiLogout className="w-5 h-5" />
                    </button>
                  )}
                  {hasCheckedOut && (
                    <span className="badge badge-success">Completed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Records */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="font-semibold text-slate-primary flex items-center gap-2">
            <HiCalendar className="w-5 h-5" />
            Attendance Records
          </h2>
          <div className="flex gap-2">
            <input
              type="date"
              className="input-field py-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <select
              className="input-field py-2"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
            >
              <option value="">All Staff</option>
              {staffList.map((staff) => (
                <option key={staff._id} value={staff._id}>{staff.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Staff ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Staff Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Shift</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check In</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check Out</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Working Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No attendance records for selected date
                  </td>
                </tr>
              ) : (
                attendanceList.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {record.staff?.employeeId || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{record.staff?.name}</td>
                    <td className="py-3 px-4 text-sm">{record.staff?.role}</td>
                    <td className="py-3 px-4 text-sm">{record.staff?.shift}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadge(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {record.checkIn ? (
                        <div>
                          <div>{new Date(record.checkIn?.time || record.checkIn).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                          {record.checkIn?.method && <span className="badge bg-gray-100 text-gray-600 text-xs mt-1">{record.checkIn.method}</span>}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {record.checkOut ? (
                        <div>
                          <div>{new Date(record.checkOut?.time || record.checkOut).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                          {record.checkOut?.method && <span className="badge bg-gray-100 text-gray-600 text-xs mt-1">{record.checkOut.method}</span>}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {record.workingHours ? `${record.workingHours.toFixed(2)} hrs` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-poppins font-semibold text-lg">
                Mark Attendance
              </h2>
              <button
                onClick={() => setShowMarkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Member *
                </label>
                <select
                  required
                  className="input-field"
                  value={markData.staffId}
                  onChange={(e) => setMarkData({ ...markData, staffId: e.target.value })}
                >
                  <option value="">Select staff member</option>
                  {staffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      [{staff.employeeId}] {staff.name} - {staff.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={markData.date}
                  onChange={(e) => setMarkData({ ...markData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  required
                  className="input-field"
                  value={markData.status}
                  onChange={(e) => setMarkData({ ...markData, status: e.target.value })}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              {markData.status === 'Present' || markData.status === 'Late' || markData.status === 'Half Day' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check In Time
                    </label>
                    <input
                      type="time"
                      className="input-field"
                      value={markData.checkIn}
                      onChange={(e) => setMarkData({ ...markData, checkIn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check Out Time
                    </label>
                    <input
                      type="time"
                      className="input-field"
                      value={markData.checkOut}
                      onChange={(e) => setMarkData({ ...markData, checkOut: e.target.value })}
                    />
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowMarkModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualMark}
                  className="btn-primary"
                  disabled={!markData.staffId}
                >
                  Mark Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
