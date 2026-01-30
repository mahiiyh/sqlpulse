import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalQueries: 0,
    totalSchedules: 0,
    totalExecutions: 0,
    successRate: 0,
  });
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [queriesRes, schedulesRes, upcomingRes, statsRes, executionsRes] = await Promise.all([
        apiClient.get('/queries'),
        apiClient.get('/schedules'),
        apiClient.get('/schedules/upcoming'),
        apiClient.get('/history/stats?days=1'), // Stats for today
        apiClient.get('/history?limit=5&sort=executed_at&order=DESC')
      ]);

      // Set stats
      setStats({
        totalQueries: queriesRes.data.data?.length || 0,
        totalSchedules: schedulesRes.data.data?.filter((s: any) => s.is_enabled).length || 0,
        totalExecutions: statsRes.data.data?.totalExecutions || 0,
        successRate: parseFloat(statsRes.data.data?.successRate || '0'),
      });

      // Set upcoming schedules
      setUpcomingSchedules(upcomingRes.data.data || []);

      // Set recent executions
      setRecentExecutions(executionsRes.data.data?.executions || []);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to SQL Query Management Dashboard
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/queries')}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">📚</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Queries
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.totalQueries}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/schedules')}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">⏰</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Schedules
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.totalSchedules}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/history')}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Executions Today
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.totalExecutions}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">✅</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Success Rate
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stats.successRate}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Executions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Executions
                </h3>
                <button
                  onClick={() => navigate('/history')}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  View All →
                </button>
              </div>
              {recentExecutions.length === 0 ? (
                <p className="text-gray-500">No recent executions</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Query
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Executed At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentExecutions.map((execution: any) => (
                        <tr key={execution.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {execution.query?.query_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                execution.status === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : execution.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {execution.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {execution.execution_time_ms ? `${execution.execution_time_ms}ms` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(execution.executed_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Schedules */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Upcoming Scheduled Queries
                </h3>
                <button
                  onClick={() => navigate('/schedules')}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  View All →
                </button>
              </div>
              {upcomingSchedules.length === 0 ? (
                <p className="text-gray-500">No upcoming schedules</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSchedules.slice(0, 5).map((schedule: any) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/schedules')}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {schedule.schedule_name}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-gray-500">
                            Next run: {new Date(schedule.next_run_time).toLocaleString()}
                          </p>
                          {schedule.cron_expression && (
                            <p className="text-xs text-gray-400 font-mono">
                              {schedule.cron_expression}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          schedule.is_enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {schedule.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => navigate('/queries')}
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  ➕ Create New Query
                </button>
                <button
                  onClick={() => navigate('/schedules')}
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  ⏰ Schedule a Query
                </button>
                <button
                  onClick={() => navigate('/connections')}
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  🔌 Add Connection
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
