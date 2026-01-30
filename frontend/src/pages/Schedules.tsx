import { useEffect, useState } from 'react';
import apiClient from '../lib/api';

interface Schedule {
  id: number;
  name: string;
  query_id: number;
  schedule_type: string;
  cron_expression: string;
  is_enabled: boolean;
  next_run_time: string;
  last_run_time: string | null;
}

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/schedules');
      setSchedules(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSchedule = async (id: number, isEnabled: boolean) => {
    try {
      await apiClient.patch(`/schedules/${id}/${isEnabled ? 'disable' : 'enable'}`);
      fetchSchedules();
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
    }
  };

  const runNow = async (id: number) => {
    try {
      await apiClient.post(`/schedules/${id}/run`);
      alert('Schedule execution triggered!');
    } catch (error) {
      console.error('Failed to run schedule:', error);
      alert('Failed to trigger execution');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
          <p className="mt-2 text-gray-600">Manage automated query schedules</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + New Schedule
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading schedules...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500 mb-4">No schedules configured</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Run</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{schedule.schedule_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {schedule.next_run_time ? new Date(schedule.next_run_time).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${schedule.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {schedule.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => runNow(schedule.id)} className="text-blue-600 hover:text-blue-900 mr-3">Run Now</button>
                    <button onClick={() => toggleSchedule(schedule.id, schedule.is_enabled)} className="text-gray-600 hover:text-gray-900">
                      {schedule.is_enabled ? 'Disable' : 'Enable'}
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
