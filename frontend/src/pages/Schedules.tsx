import { useEffect, useState } from 'react';
import apiClient from '../lib/api';
import toast from 'react-hot-toast';
import CreateScheduleModal from '../components/CreateScheduleModal';
import ScheduleDetailModal from '../components/ScheduleDetailModal';

interface Schedule {
  id: number;
  schedule_name: string;
  query_id: number;
  cron_expression: string;
  is_enabled: boolean;
  next_run_time: string;
  last_run_time: string | null;
  max_retries: number;
  notification_enabled: boolean;
  query?: { name: string };
  connection?: { name: string; environment: string };
}

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/schedules');
      setSchedules(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const toggleSchedule = async (id: number, isEnabled: boolean) => {
    try {
      await apiClient.post(`/schedules/${id}/${isEnabled ? 'disable' : 'enable'}`);
      toast.success(isEnabled ? 'Schedule disabled' : 'Schedule enabled');
      fetchSchedules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle schedule');
    }
  };

  const runNow = async (id: number) => {
    try {
      await apiClient.post(`/schedules/${id}/run-now`);
      toast.success('Schedule execution triggered!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to trigger execution');
    }
  };

  const deleteSchedule = async (id: number, name: string) => {
    if (!confirm(`Delete schedule "${name}"? This action cannot be undone.`)) return;

    try {
      await apiClient.delete(`/schedules/${id}`);
      toast.success('Schedule deleted');
      fetchSchedules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete schedule');
    }
  };

  const filteredSchedules = schedules.filter(s => {
    if (filterEnabled === 'enabled') return s.is_enabled;
    if (filterEnabled === 'disabled') return !s.is_enabled;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedules</h1>
          <p className="mt-2 text-gray-600">Manage automated query schedules</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Schedule
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['all', 'enabled', 'disabled'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterEnabled(filter)}
            className={`pb-2 px-4 font-medium text-sm capitalize ${
              filterEnabled === filter
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {filter} ({schedules.filter(s => 
              filter === 'all' ? true : 
              filter === 'enabled' ? s.is_enabled : !s.is_enabled
            ).length})
          </button>
        ))}
      </div>

      <CreateScheduleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchSchedules}
      />

      <ScheduleDetailModal
        scheduleId={selectedScheduleId}
        isOpen={selectedScheduleId !== null}
        onClose={() => setSelectedScheduleId(null)}
        onUpdate={fetchSchedules}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {filterEnabled === 'all' ? 'No schedules configured' : `No ${filterEnabled} schedules`}
          </div>
          {filterEnabled === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first schedule
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Query
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50 dark:bg-gray-700/50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{schedule.schedule_name}</div>
                      <div className="text-xs text-gray-500 font-mono">{schedule.cron_expression}</div>
                      <div className="flex gap-2 mt-1">
                        {schedule.notification_enabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notifications
                          </span>
                        )}
                        {schedule.max_retries > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry {schedule.max_retries}x
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {schedule.query?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div>
                      {schedule.connection?.name}
                      {schedule.connection?.environment && (
                        <span className={`ml-2 inline-block px-2 py-0.5 rounded text-xs ${
                          schedule.connection.environment === 'production'
                            ? 'bg-red-100 text-red-700'
                            : schedule.connection.environment === 'staging'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {schedule.connection.environment}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {schedule.next_run_time ? new Date(schedule.next_run_time).toLocaleString() : 'Not scheduled'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      schedule.is_enabled ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => setSelectedScheduleId(schedule.id)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => runNow(schedule.id)}
                      className="text-green-600 hover:text-green-900 font-medium"
                    >
                      Run Now
                    </button>
                    <button
                      onClick={() => toggleSchedule(schedule.id, schedule.is_enabled)}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                    >
                      {schedule.is_enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id, schedule.schedule_name)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
