import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../lib/api';
import { logger } from '../utils/logger';
import ShareWithTeamModal from '../components/ShareWithTeamModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast';

interface Query {
  id: number;
  name: string;
  description: string;
  sql_query: string;
  category: string;
  is_public: boolean;
  is_dangerous: boolean;
  execution_count: number;
  created_at: string;
  created_by?: number;
}

export default function QueryLibrary() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; queryId?: number; queryName?: string }>({ isOpen: false });
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; query?: Query }>({ isOpen: false });
  const toast = useToast();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchQueries();
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

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/queries');
      setQueries(response.data.data || []);
    } catch (error) {
      logger.error('Failed to fetch queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (query: Query) => {
    setConfirmDelete({ isOpen: true, query });
  };

  const handleDeleteConfirm = async () => {
    const query = confirmDelete.query;
    if (!query) return;
    
    try {
      await apiClient.delete(`/queries/${query.id}`);
      setQueries(queries.filter(q => q.id !== query.id));
      toast.success(`Query "${query.name}" deleted successfully!`);
    } catch (error: any) {
      logger.error('Failed to delete query:', error);
      if (error.response?.status === 403) {
        toast.error('You can only delete queries you created');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete query');
      }
    } finally {
      setConfirmDelete({ isOpen: false });
    }
  };

  const filteredQueries = queries.filter(q =>
    q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Query Library</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Browse and manage your SQL queries</p>
        </div>
        <Link
          to="/queries/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Query
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search queries by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white shadow-sm"
        />
      </div>

      {/* Queries Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading queries...</div>
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No queries match your search' : 'No queries yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first SQL query'}
          </p>
          {!searchTerm && (
            <Link
              to="/queries/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first query
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQueries.map((query) => (
            <div
              key={query.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transform hover:-translate-y-2 group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{query.name}</h3>
                {query.is_dangerous && (
                  <span className="text-red-500" title="Dangerous query">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {query.description || 'No description'}
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                  {query.category}
                </span>
                {query.is_public && (
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                    Public
                  </span>
                )}
                {query.created_by && query.created_by !== currentUserId && (
                  <span className="px-2 py-1 text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded">
                    Shared
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Executed {query.execution_count} times
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/queries/${query.id}`}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm text-center"
                >
                  View
                </Link>
                {currentUserId === query.created_by && (
                  <button
                    onClick={() => setShareModal({ isOpen: true, queryId: query.id, queryName: query.name })}
                    className="px-3 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors text-sm"
                    title="Share with team"
                  >
                    Share
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(query)}
                  disabled={currentUserId !== query.created_by}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title={currentUserId !== query.created_by ? 'You can only delete queries you created' : 'Delete query'}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareModal.queryId && (
        <ShareWithTeamModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({ isOpen: false })}
          resourceType="query"
          resourceId={shareModal.queryId}
          resourceName={shareModal.queryName || 'Query'}
          onSuccess={() => {
            toast.success('Query shared successfully!');
            fetchQueries();
          }}
          onError={(message) => toast.error(message)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Query"
        message={`Are you sure you want to delete "${confirmDelete.query?.name}"? This action cannot be undone.`}
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
