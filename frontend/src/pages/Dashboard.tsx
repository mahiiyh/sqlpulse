import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../utils/logger';
import WelcomeModal from '../components/WelcomeModal';
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
import Loader from '../components/Loader';

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
    const startTime = Date.now();
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
      logger.error('Failed to fetch dashboard data:', error);
    } finally {
      // Ensure loader shows for at least 800ms for better UX
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);
      setTimeout(() => setLoading(false), remainingTime);
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
      logger.error('Failed to refresh queue data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <WelcomeModal />
      {loading ? (
        <div className="space-y-6 animate-pulse\">\n          {/* Header skeleton */}\n          <div className=\"flex justify-between items-center\">\n            <div className=\"h-8 bg-gray-200 dark:bg-gray-700 rounded w-64\"></div>\n            <div className=\"h-10 bg-gray-200 dark:bg-gray-700 rounded w-32\"></div>\n          </div>\n          \n          {/* Stats skeleton */}\n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">\n            {[...Array(4)].map((_, i) => (\n              <div key={i} className=\"bg-white dark:bg-gray-800 rounded-lg shadow p-6\">\n                <div className=\"h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4\"></div>\n                <div className=\"h-8 bg-gray-200 dark:bg-gray-700 rounded w-16\"></div>\n              </div>\n            ))}\n          </div>\n          \n          {/* Chart skeleton */}\n          <div className=\"bg-white dark:bg-gray-800 rounded-lg shadow p-6\">\n            <div className=\"h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6\"></div>\n            <div className=\"h-64 bg-gray-200 dark:bg-gray-700 rounded\"></div>\n          </div>\n        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Monitor your SQL query workflows and performance
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Auto-refresh</span>
                </label>
                <button
                  onClick={fetchDashboardData}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Queries Card */}
            <div 
              className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-gray-700 group"
              onClick={() => navigate('/queries')}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Total Queries
                    </p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {stats.totalQueries}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Schedules Card */}
            <div 
              className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-gray-700 group"
              onClick={() => navigate('/schedules')}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Active Schedules
                    </p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {stats.totalSchedules}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Executions Today Card */}
            <div 
              className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-gray-700 group"
              onClick={() => navigate('/history')}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Executions Today
                    </p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {stats.totalExecutions}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Rate Card */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Success Rate
                    </p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {stats.successRate}%
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
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
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
                      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
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
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Currently Running Jobs ({activeJobs.length})
                </h3>
                <div className="space-y-3">
                  {activeJobs.map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
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
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
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
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {recentExecutions.map((execution: any) => (
                        <tr key={execution.id} className="hover:bg-gray-50 dark:bg-gray-700/50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {execution.query?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                execution.status === 'success'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : execution.status === 'failed'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
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
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      onClick={() => navigate('/schedules')}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
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
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => navigate('/queries')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Query
                </button>
                <button
                  onClick={() => navigate('/schedules')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Schedule a Query
                </button>
                <button
                  onClick={() => navigate('/connections')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Add Connection
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
