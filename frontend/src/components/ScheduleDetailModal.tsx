import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import { logger } from '../utils/logger';
import toast from 'react-hot-toast';
import Loader from './Loader';

interface Schedule {
  id: number;
  schedule_name: string;
  query_id: number;
  connection_id: number;
  cron_expression: string;
  is_enabled: boolean;
  next_run_time: string;
  last_run_time: string | null;
  max_retries: number;
  retry_delay_seconds: number;
  exponential_backoff: boolean;
  notification_enabled: boolean;
  notification_channel: string | null;
  notification_config: any;
  query?: { name: string };
  connection?: { name: string };
}

interface Dependency {
  id: number;
  depends_on_schedule_id: number;
  dependency_type: string;
  condition_config: any;
  is_active: boolean;
  dependsOnSchedule: {
    id: number;
    schedule_name: string;
    is_enabled: boolean;
  };
}

interface Props {
  scheduleId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ScheduleDetailModal({ scheduleId, isOpen, onClose, onUpdate }: Props) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'retry' | 'notifications' | 'dependencies' | 'history'>('details');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (isOpen && scheduleId) {
      fetchScheduleDetails();
      fetchDependencies();
      if (activeTab === 'history') {
        fetchExecutionHistory();
      }
    }
  }, [isOpen, scheduleId, activeTab]);

  const fetchScheduleDetails = async () => {
    if (!scheduleId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/schedules/${scheduleId}`);
      setSchedule(response.data.data);
    } catch (error: any) {
      toast.error('Failed to fetch schedule details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    if (!scheduleId) return;
    
    try {
      const response = await apiClient.get(`/schedules/${scheduleId}/dependencies`);
      setDependencies(response.data || []);
    } catch (error) {
      logger.error('Failed to fetch dependencies:', error);
    }
  };

  const fetchExecutionHistory = async () => {
    if (!scheduleId) return;
    
    try {
      const response = await apiClient.get(`/schedules/${scheduleId}/history?limit=20`);
      setExecutionHistory(response.data.data?.executions || []);
    } catch (error) {
      logger.error('Failed to fetch execution history:', error);
    }
  };

  const handleUpdate = async () => {
    if (!schedule) return;

    try {
      await apiClient.put(`/schedules/${schedule.id}`, {
        max_retries: schedule.max_retries,
        retry_delay_seconds: schedule.retry_delay_seconds,
        exponential_backoff: schedule.exponential_backoff,
        notification_enabled: schedule.notification_enabled,
        notification_channel: schedule.notification_channel,
        notification_config: schedule.notification_config
      });
      
      toast.success('Schedule updated successfully');
      setEditing(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update schedule');
    }
  };

  const handleRemoveDependency = async (depId: number) => {
    if (!confirm('Remove this dependency?')) return;

    try {
      await apiClient.delete(`/dependencies/${depId}`);
      toast.success('Dependency removed');
      fetchDependencies();
    } catch (error: any) {
      toast.error('Failed to remove dependency');
    }
  };

  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{schedule.schedule_name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Query: {schedule.query?.name} • Connection: {schedule.connection?.name}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            {(['details', 'retry', 'notifications', 'dependencies', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <Loader size="md" text="Loading schedule details..." />
          ) : (
            <>
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        schedule.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression</label>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{schedule.cron_expression}</code>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Next Run</label>
                      <p className="text-sm text-gray-900">
                        {schedule.next_run_time ? new Date(schedule.next_run_time).toLocaleString() : 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Run</label>
                      <p className="text-sm text-gray-900">
                        {schedule.last_run_time ? new Date(schedule.last_run_time).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'retry' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Retry Configuration</h3>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Retries</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      disabled={!editing}
                      value={schedule.max_retries}
                      onChange={(e) => setSchedule({ ...schedule, max_retries: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of retry attempts after failure (0-10)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Retry Delay (seconds)</label>
                    <input
                      type="number"
                      min="1"
                      disabled={!editing}
                      value={schedule.retry_delay_seconds}
                      onChange={(e) => setSchedule({ ...schedule, retry_delay_seconds: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Delay between retry attempts</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={!editing}
                        checked={schedule.exponential_backoff}
                        onChange={(e) => setSchedule({ ...schedule, exponential_backoff: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-700">Exponential Backoff</span>
                    </label>
                    <p className="text-xs text-gray-500 ml-6">Double delay with each retry attempt</p>
                  </div>

                  {editing && (
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          fetchScheduleDetails();
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        disabled={!editing}
                        checked={schedule.notification_enabled}
                        onChange={(e) => setSchedule({ ...schedule, notification_enabled: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Notifications</span>
                    </label>
                  </div>

                  {schedule.notification_enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notification Channel</label>
                        <select
                          disabled={!editing}
                          value={schedule.notification_channel || ''}
                          onChange={(e) => setSchedule({ ...schedule, notification_channel: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        >
                          <option value="">Select Channel</option>
                          <option value="email">Email</option>
                          <option value="slack">Slack</option>
                          <option value="webhook">Webhook</option>
                        </select>
                      </div>

                      {schedule.notification_channel === 'email' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <input
                            type="email"
                            disabled={!editing}
                            value={schedule.notification_config?.email || ''}
                            onChange={(e) => setSchedule({
                              ...schedule,
                              notification_config: { ...schedule.notification_config, email: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                            placeholder="user@example.com"
                          />
                        </div>
                      )}

                      {schedule.notification_channel === 'slack' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Slack Webhook URL</label>
                          <input
                            type="url"
                            disabled={!editing}
                            value={schedule.notification_config?.webhook_url || ''}
                            onChange={(e) => setSchedule({
                              ...schedule,
                              notification_config: { ...schedule.notification_config, webhook_url: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                            placeholder="https://hooks.slack.com/services/..."
                          />
                        </div>
                      )}

                      {schedule.notification_channel === 'webhook' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                          <input
                            type="url"
                            disabled={!editing}
                            value={schedule.notification_config?.webhook_url || ''}
                            onChange={(e) => setSchedule({
                              ...schedule,
                              notification_config: { ...schedule.notification_config, webhook_url: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                            placeholder="https://your-webhook-url.com/endpoint"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {editing && (
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          fetchScheduleDetails();
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'dependencies' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Schedule Dependencies</h3>
                  </div>

                  {dependencies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No dependencies configured. This schedule will run independently.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dependencies.map((dep) => (
                        <div key={dep.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  {dep.dependsOnSchedule.schedule_name}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  dep.dependsOnSchedule.is_enabled
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {dep.dependsOnSchedule.is_enabled ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Type:</span> {dep.dependency_type.replace('_', ' ')}
                              </div>
                              {dep.condition_config && Object.keys(dep.condition_config).length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Conditions: {JSON.stringify(dep.condition_config)}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveDependency(dep.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Execution History</h3>
                    <button 
                      onClick={fetchExecutionHistory}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>

                  {executionHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No execution history yet. Run this schedule to see results here.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {executionHistory.map((execution: any) => (
                        <div 
                          key={execution.id} 
                          className={`border rounded-lg p-4 ${
                            execution.status === 'success' 
                              ? 'border-green-200 bg-green-50' 
                              : execution.status === 'failed'
                              ? 'border-red-200 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {execution.status === 'success' ? (
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : execution.status === 'failed' ? (
                                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {execution.query?.name || 'Unknown Query'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {new Date(execution.executed_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              execution.status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : execution.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {execution.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <p className="font-medium">
                                {execution.execution_time_ms ? `${execution.execution_time_ms}ms` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Rows:</span>
                              <p className="font-medium">
                                {execution.rows_affected || 0}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Connection:</span>
                              <p className="font-medium text-xs">
                                {execution.connection?.name || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {execution.error_message && (
                            <div className="mt-3 pt-3 border-t border-red-200">
                              <p className="text-xs text-red-700 font-mono">
                                {execution.error_message}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
