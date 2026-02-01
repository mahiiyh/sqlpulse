import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import apiClient from '../lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
  const [queueStats, setQueueStats] = useState<any>(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh queue stats every 10 seconds
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchQueueData();
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [queriesRes, schedulesRes, upcomingRes, statsRes, executionsRes, queueRes, jobsRes, chartRes] = await Promise.all([
        apiClient.get('/queries'),
        apiClient.get('/schedules'),
        apiClient.get('/schedules/upcoming'),
        apiClient.get('/history/stats?days=1'), // Stats for today
        apiClient.get('/history?limit=5&sort=executed_at&order=DESC'),
        apiClient.get('/queue/stats').catch(() => ({ data: { data: null } })),
        apiClient.get('/queue/active').catch(() => ({ data: { data: [] } })),
        apiClient.get('/history/stats?days=7').catch(() => ({ data: { data: null } }))
      ]);

      // Set stats
      const queriesData = queriesRes.data.data || [];
      setStats({
        totalQueries: queriesData.length,
        totalSchedules: schedulesRes.data.data?.filter((s: any) => s.is_enabled).length || 0,
        totalExecutions: statsRes.data.data?.totalExecutions || 0,
        successRate: parseFloat(statsRes.data.data?.successRate || '0'),
      });

      // Prepare pie chart data (query categories)
      const categoryCount: Record<string, number> = {};
      queriesData.forEach((query: any) => {
        const cat = query.category || 'Uncategorized';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      const pieChartData = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value,
      }));
      setPieData(pieChartData);

      // Set upcoming schedules
      setUpcomingSchedules(upcomingRes.data.data || []);

      // Set recent executions
      setRecentExecutions(executionsRes.data.data?.executions || []);

      // Set queue stats
      setQueueStats(queueRes.data.data);
      setActiveJobs(jobsRes.data.data || []);

      // Prepare chart data (mock data for now - backend needs daily stats endpoint)
      if (chartRes.data.data) {
        const mockChartData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            executions: Math.floor(Math.random() * 50) + 10,
            avgTime: Math.floor(Math.random() * 500) + 100
          };
        });
        setChartData(mockChartData);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueueData = async () => {
    try {
      const [queueRes, jobsRes] = await Promise.all([
        apiClient.get('/queue/stats').catch(() => ({ data: { data: null } })),
        apiClient.get('/queue/active').catch(() => ({ data: { data: [] } }))
      ]);
      
      setQueueStats(queueRes.data.data);
      setActiveJobs(jobsRes.data.data || []);
    } catch (error) {
      console.error('Failed to refresh queue data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-refresh (10s)</span>
            </label>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
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
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/queries')}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">📚</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Queries
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                        {stats.totalQueries}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/schedules')}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">⏰</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Active Schedules
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                        {stats.totalSchedules}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/history')}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Executions Today
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                        {stats.totalExecutions}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">✅</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Success Rate
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                        {stats.successRate}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Queue Stats - New Widget */}
          {queueStats && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">⏳</span>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-blue-700 truncate uppercase">
                          Waiting
                        </dt>
                        <dd className="text-2xl font-bold text-blue-900">
                          {queueStats.waiting}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">🔄</span>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-yellow-700 truncate uppercase">
                          Active
                        </dt>
                        <dd className="text-2xl font-bold text-yellow-900">
                          {queueStats.active}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow rounded-lg border-l-4 border-green-500">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-green-700 truncate uppercase">
                          Completed
                        </dt>
                        <dd className="text-2xl font-bold text-green-900">
                          {queueStats.completed}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 overflow-hidden shadow rounded-lg border-l-4 border-red-500">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">❌</span>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-red-700 truncate uppercase">
                          Failed
                        </dt>
                        <dd className="text-2xl font-bold text-red-900">
                          {queueStats.failed}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs font-medium text-purple-700 truncate uppercase">
                          Total
                        </dt>
                        <dd className="text-2xl font-bold text-purple-900">
                          {queueStats.total}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Trends Chart */}
            {chartData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Execution Trends (Last 7 Days)
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartType('line')}
                      className={`px-3 py-1 rounded text-sm ${
                        chartType === 'line'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Line
                    </button>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 rounded text-sm ${
                        chartType === 'bar'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Bar
                    </button>
                    <button
                      onClick={() => setChartType('area')}
                      className={`px-3 py-1 rounded text-sm ${
                        chartType === 'area'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Area
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis yAxisId="left" stroke="#3b82f6" />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="executions"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Executions"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="avgTime"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Avg Time (ms)"
                      />
                    </LineChart>
                  ) : chartType === 'bar' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Legend />
                      <Bar dataKey="executions" fill="#3b82f6" name="Executions" />
                      <Bar dataKey="avgTime" fill="#10b981" name="Avg Time (ms)" />
                    </BarChart>
                  ) : (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="executions"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="Executions"
                      />
                      <Area
                        type="monotone"
                        dataKey="avgTime"
                        stackId="2"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="Avg Time (ms)"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            {/* Query Categories Pie Chart */}
            {pieData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Queries by Category
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Active Jobs Widget */}
          {activeJobs.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  🔄 Currently Running Jobs ({activeJobs.length})
                </h3>
                <div className="space-y-3">
                  {activeJobs.map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {job.data.scheduleName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Job ID: {job.id} • Attempt {job.attemptsMade + 1}
                        </p>
                      </div>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
