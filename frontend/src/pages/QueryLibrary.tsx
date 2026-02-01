import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../lib/api';

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
}

export default function QueryLibrary() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/queries');
      setQueries(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      await apiClient.delete(`/queries/${id}`);
      setQueries(queries.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to delete query:', error);
      alert('Failed to delete query');
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
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'No queries match your search' : 'No queries yet'}
          </div>
          {!searchTerm && (
            <Link
              to="/queries/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create your first query
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQueries.map((query) => (
            <div
              key={query.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
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
                <Link
                  to={`/queries/${query.id}`}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm text-center"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(query.id, query.name)}
                  className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
