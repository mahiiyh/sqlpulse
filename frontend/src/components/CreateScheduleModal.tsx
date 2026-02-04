import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import apiClient from '../lib/api';
import { logger } from '../utils/logger';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Query {
  id: number;
  name: string;
}

interface Connection {
  id: number;
  name: string;
}

export default function CreateScheduleModal({ isOpen, onClose, onSuccess }: CreateScheduleModalProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schedule_name: '',
    description: '',
    query_id: '',
    connection_id: '',
    schedule_type: 'cron',
    cron_expression: '0 0 * * *',
    timezone: 'UTC',
    is_enabled: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchQueries();
      fetchConnections();
    }
  }, [isOpen]);

  const fetchQueries = async () => {
    try {
      const response = await apiClient.get('/queries');
      setQueries(response.data.data || []);
    } catch (error) {
      logger.error('Failed to fetch queries:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await apiClient.get('/connections');
      setConnections(response.data.data || []);
    } catch (error) {
      logger.error('Failed to fetch connections:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post('/schedules', {
        ...formData,
        query_id: parseInt(formData.query_id),
        connection_id: parseInt(formData.connection_id)
      });
      onSuccess();
      onClose();
      setFormData({
        schedule_name: '',
        description: '',
        query_id: '',
        connection_id: '',
        schedule_type: 'cron',
        cron_expression: '0 0 * * *',
        timezone: 'UTC',
        is_enabled: true
      });
    } catch (error) {
      logger.error('Failed to create schedule:', error);
      alert('Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create Schedule</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Name *
            </label>
            <input
              type="text"
              required
              value={formData.schedule_name}
              onChange={(e) => setFormData({ ...formData, schedule_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Query *
            </label>
            <select
              required
              value={formData.query_id}
              onChange={(e) => setFormData({ ...formData, query_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a query</option>
              {queries.map((query) => (
                <option key={query.id} value={query.id}>
                  {query.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connection *
            </label>
            <select
              required
              value={formData.connection_id}
              onChange={(e) => setFormData({ ...formData, connection_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a connection</option>
              {connections.map((connection) => (
                <option key={connection.id} value={connection.id}>
                  {connection.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Type *
              </label>
              <select
                required
                value={formData.schedule_type}
                onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="cron">Cron Expression</option>
                <option value="interval">Interval</option>
                <option value="one_time">One Time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>

          {formData.schedule_type === 'cron' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cron Expression *
              </label>
              <input
                type="text"
                required
                value={formData.cron_expression}
                onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
                placeholder="0 0 * * * (daily at midnight)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Examples: "0 * * * *" (hourly), "0 0 * * *" (daily), "0 0 * * 0" (weekly)
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_enabled}
              onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable schedule immediately</span>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Schedule'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
