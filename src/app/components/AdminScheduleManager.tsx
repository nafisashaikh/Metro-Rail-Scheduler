import { useState, useEffect } from 'react';
import { ScheduleItem } from '../types';
import { Plus, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { apiUrl } from '../config/api';

interface AdminScheduleManagerProps {
  authToken: string;
}

export function AdminScheduleManager({ authToken }: AdminScheduleManagerProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<ScheduleItem, 'id'>>({
    line: '',
    from: '',
    to: '',
    departureTime: '',
    platform: '',
    status: 'on-time',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(apiUrl('/schedules'), {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) throw new Error('Failed to fetch schedules');

      const data = (await response.json()) as { schedules: ScheduleItem[] };
      setSchedules(data.schedules);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.line.trim()) errors.line = 'Line is required';
    if (!formData.from.trim()) errors.from = 'Departure station is required';
    if (!formData.to.trim()) errors.to = 'Destination station is required';
    if (!formData.departureTime.trim()) errors.departureTime = 'Departure time is required';
    if (!/^\d{2}:\d{2}$/.test(formData.departureTime)) {
      errors.departureTime = 'Time must be in HH:MM format';
    }
    if (!formData.platform.trim()) errors.platform = 'Platform is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSchedule = async () => {
    if (!validateForm()) return;

    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(apiUrl('/schedules'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create schedule');
      }

      const data = (await response.json()) as { schedule: ScheduleItem };
      setSchedules([...schedules, data.schedule]);
      setSuccessMessage('Schedule created successfully!');
      resetForm();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schedule');
    }
  };

  const handleUpdateSchedule = async (id: string) => {
    if (!validateForm()) return;

    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(apiUrl(`/schedules/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update schedule');
      }

      const data = (await response.json()) as { schedule: ScheduleItem };
      setSchedules(schedules.map((s) => (s.id === id ? data.schedule : s)));
      setSuccessMessage('Schedule updated successfully!');
      resetForm();
      setEditingId(null);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(apiUrl(`/schedules/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete schedule');
      }

      setSchedules(schedules.filter((s) => s.id !== id));
      setSuccessMessage('Schedule deleted successfully!');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule');
    }
  };

  const resetForm = () => {
    setFormData({
      line: '',
      from: '',
      to: '',
      departureTime: '',
      platform: '',
      status: 'on-time',
    });
    setValidationErrors({});
    setIsAdding(false);
  };

  const handleEditClick = (schedule: ScheduleItem) => {
    setFormData({
      line: schedule.line,
      from: schedule.from,
      to: schedule.to,
      departureTime: schedule.departureTime,
      platform: schedule.platform,
      status: schedule.status,
    });
    setEditingId(schedule.id);
  };

  const getStatusColor = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'on-time':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'delayed':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'arriving':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Train Schedule Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add, edit, or remove train schedules</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(!isAdding);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancel' : 'Add Schedule'}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-800 dark:text-emerald-300 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-800 dark:text-red-300 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {editingId ? 'Edit Schedule' : 'Add New Schedule'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Line Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Line <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.line}
                onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                placeholder="e.g., Aqua Line, Yellow Line"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                  validationErrors.line ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              {validationErrors.line && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.line}</p>
              )}
            </div>

            {/* From Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                From <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                placeholder="e.g., Ghatkopar"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                  validationErrors.from ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              {validationErrors.from && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.from}</p>
              )}
            </div>

            {/* To Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="e.g., Versova"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                  validationErrors.to ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              {validationErrors.to && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.to}</p>
              )}
            </div>

            {/* Departure Time Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Departure Time (HH:MM) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                placeholder="e.g., 08:30"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                  validationErrors.departureTime ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              {validationErrors.departureTime && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.departureTime}</p>
              )}
            </div>

            {/* Platform Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Platform <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                placeholder="e.g., 2, A, North"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                  validationErrors.platform ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              {validationErrors.platform && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.platform}</p>
              )}
            </div>

            {/* Status Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ScheduleItem['status'],
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="on-time">On Time</option>
                <option value="delayed">Delayed</option>
                <option value="arriving">Arriving</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => (editingId ? handleUpdateSchedule(editingId) : handleAddSchedule())}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Schedules Table */}
      {!loading && schedules.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Line
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    From
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    To
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Departure Time
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Platform
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">
                      {schedule.line}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{schedule.from}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{schedule.to}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {schedule.departureTime}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{schedule.platform}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {schedule.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(schedule)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit schedule"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && schedules.length === 0 && !isAdding && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">No schedules yet</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mb-4">
            Add your first train schedule to get started
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Add First Schedule
          </button>
        </div>
      )}
    </div>
  );
}
