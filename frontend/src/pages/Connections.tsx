import { useEffect, useState } from 'react';
import apiClient from '../lib/api';
import { logger } from '../utils/logger';
import ShareWithTeamModal from '../components/ShareWithTeamModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast';

interface Connection {
  id: number;
  name: string;
  type: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  environment: string;
  is_active: boolean;
  created_by?: number;
}

export default function Connections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; connectionId?: number; connectionName?: string }>({
    isOpen: false,
  });
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; connection?: Connection }>({ isOpen: false });
  const toast = useToast();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql',
    host: '',
    port: 5432,
    database_name: '',
    username: '',
    password: '',
    environment: 'dev',
  });

  useEffect(() => {
    fetchConnections();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setCurrentUserId(response.data.data.id);
    } catch (error) {
      logger.error('Failed to fetch current user:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/connections');
      setConnections(response.data.data || []);
    } catch (error) {
      logger.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/connections', formData);
      setShowForm(false);
      setFormData({
        name: '',
        type: 'postgresql',
        host: '',
        port: 5432,
        database_name: '',
        username: '',
        password: '',
        environment: 'dev',
      });
      toast.success('Connection created successfully!');
      fetchConnections();
    } catch (error: any) {
      logger.error('Failed to create connection:', error);
      toast.error(error.response?.data?.message || 'Failed to create connection');
    }
  };

  const handleDeleteClick = (connection: Connection) => {
    setConfirmDelete({ isOpen: true, connection });
  };

  const handleDeleteConfirm = async () => {
    const connection = confirmDelete.connection;
    if (!connection) return;

    try {
      await apiClient.delete(`/connections/${connection.id}`);
      toast.success(`Connection "${connection.name}" deleted successfully!`);
      fetchConnections();
    } catch (error: any) {
      logger.error('Failed to delete connection:', error);
      if (error.response?.status === 403) {
        toast.error('You can only delete connections you created');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete connection');
      }
    } finally {
      setConfirmDelete({ isOpen: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Database Connections</h1>
          <p className="mt-2 text-gray-600">Manage database connections</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ New Connection'}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search connections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="sqlserver">SQL Server</option>
        </select>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Connection</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Database Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    let defaultPort = 5432;
                    if (type === 'mysql') defaultPort = 3306;
                    else if (type === 'sqlserver') defaultPort = 1433;
                    else if (type === 'oracle') defaultPort = 1521;
                    setFormData({ ...formData, type, port: defaultPort });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="sqlserver">SQL Server</option>
                  <option value="oracle">Oracle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {formData.type === 'sqlserver' ? 'Server' : 'Host'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  placeholder={formData.type === 'sqlserver' ? 'server.database.windows.net' : 'localhost'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Port</label>
                <input
                  type="number"
                  required
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Database Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.database_name}
                  onChange={(e) => setFormData({ ...formData, database_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Environment
                </label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="dev">Development</option>
                  <option value="qa">QA</option>
                  <option value="uat">UAT</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Connection
            </button>
          </form>
        </div>
      )}

      {/* Connections List */}
      {loading ? (
        <div className="text-center py-12">Loading connections...</div>
      ) : connections.filter(conn => 
          (filterType === 'all' || conn.type === filterType) &&
          (searchTerm === '' || conn.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           conn.host.toLowerCase().includes(searchTerm.toLowerCase()))
        ).length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {connections.length === 0 ? 'No connections yet' : 'No matching connections'}
          </div>
          {connections.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create your first connection
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.filter(conn => 
            (filterType === 'all' || conn.type === filterType) &&
            (searchTerm === '' || conn.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             conn.host.toLowerCase().includes(searchTerm.toLowerCase()))
          ).map((conn) => (
            <div key={conn.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{conn.name}</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {conn.type.toUpperCase()}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    conn.environment === 'production'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : conn.environment === 'uat'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  }`}
                >
                  {conn.environment}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {conn.host}:{conn.port}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  {conn.database_name}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {conn.username}
                </div>
                {conn.created_by && conn.created_by !== currentUserId && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mt-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Shared with you
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {currentUserId === conn.created_by && (
                  <button
                    onClick={() => setShareModal({ isOpen: true, connectionId: conn.id, connectionName: conn.name })}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    title="Share with team"
                  >
                    Share
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(conn)}
                  disabled={currentUserId !== conn.created_by}
                  className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={currentUserId !== conn.created_by ? 'You can only delete connections you created' : 'Delete connection'}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareModal.connectionId && (
        <ShareWithTeamModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({ isOpen: false })}
          resourceType="connection"
          resourceId={shareModal.connectionId}
          resourceName={shareModal.connectionName || 'Connection'}
          onSuccess={() => {
            toast.success('Connection shared successfully!');
            fetchConnections();
          }}
          onError={(message) => toast.error(message)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Connection"
        message={`Are you sure you want to delete "${confirmDelete.connection?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ isOpen: false })}
      />

      {/* Toast Container */}
      <toast.ToastContainer />
    </div>
  );
}
