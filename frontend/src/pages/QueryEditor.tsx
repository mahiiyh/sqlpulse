import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import apiClient from '../lib/api';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';

interface Connection {
  id: number;
  name: string;
  type: string;
  environment: string;
}

interface ExecutionResult {
  rows: any[];
  rowsAffected: number;
  executionTime: number;
  fields?: any[];
  executionHistoryId: number;
}

export default function QueryEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sql_content: '',
    category: 'other',
    database_type: 'postgresql',
    project_name: '',
    is_public: false,
    is_dangerous: false,
    is_schedulable: true
  });

  useEffect(() => {
    fetchConnections();
    if (id) {
      fetchQuery();
    } else if (location.state?.sql) {
      // Load template SQL if provided
      setFormData(prev => ({ ...prev, sql_content: location.state.sql }));
    }
  }, [id, location.state]);

  const fetchConnections = async () => {
    try {
      const response = await apiClient.get('/connections');
      setConnections(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedConnectionId(response.data.data[0].id);
      }
    } catch (error) {
      logger.error('Failed to fetch connections:', error);
    }
  };

  const fetchQuery = async () => {
    try {
      const response = await apiClient.get(`/queries/${id}`);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch query:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await apiClient.put(`/queries/${id}`, formData);
        toast.success('Query updated successfully');
      } else {
        const response = await apiClient.post('/queries', formData);
        toast.success('Query created successfully');
        navigate(`/queries/${response.data.data.id}`);
        return;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save query');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!id) {
      toast.error('Please save the query before executing');
      return;
    }

    if (!selectedConnectionId) {
      toast.error('Please select a connection');
      return;
    }

    setExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);
    setCurrentPage(1);

    try {
      const response = await apiClient.post(`/queries/${id}/execute`, {
        connection_id: selectedConnectionId
      });
      
      setExecutionResult(response.data.data);
      toast.success(`Query executed successfully in ${response.data.data.executionTime}ms`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Execution failed';
      setExecutionError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setExecuting(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    if (!executionResult) {
      toast.error('No results to export');
      return;
    }

    try {
      const response = await apiClient.post(`/queries/${id}/export`, {
        execution_history_id: executionResult.executionHistoryId,
        format
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `query_results_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Export failed');
    }
  };

  // Pagination
  const totalPages = executionResult ? Math.ceil(executionResult.rows.length / rowsPerPage) : 0;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = executionResult?.rows.slice(startIndex, endIndex) || [];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {id ? 'Edit Query' : 'Create Query'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Define your SQL query and metadata</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Query Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="reporting">Reporting</option>
              <option value="analytics">Analytics</option>
              <option value="etl">ETL</option>
              <option value="maintenance">Maintenance</option>
              <option value="testing">Testing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Database Type *
            </label>
            <select
              required
              value={formData.database_type}
              onChange={(e) => setFormData({ ...formData, database_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlserver">SQL Server</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={formData.project_name}
            onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SQL Content *
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white overflow-hidden">
            <Editor
              height="400px"
              language="sql"
              value={formData.sql_content}
              onChange={(value) => setFormData({ ...formData, sql_content: value || '' })}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 2,
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Use Ctrl+Space for autocomplete, Ctrl+F to find</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Public (visible to all users)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_dangerous}
              onChange={(e) => setFormData({ ...formData, is_dangerous: e.target.checked })}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Dangerous (requires extra confirmation)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_schedulable}
              onChange={(e) => setFormData({ ...formData, is_schedulable: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Schedulable</span>
          </label>
        </div>

        {id && connections.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Execute Query</h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Connection
                </label>
                <select
                  value={selectedConnectionId || ''}
                  onChange={(e) => setSelectedConnectionId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {connections.map((conn) => (
                    <option key={conn.id} value={conn.id}>
                      {conn.name} ({conn.type} - {conn.environment})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleExecute}
                disabled={executing}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {executing ? 'Executing...' : '▶ Execute'}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Query' : 'Create Query'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/queries')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Execution Results */}
      {executionResult && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-green-600">✓ Execution Successful</h3>
                <span className="text-sm text-gray-600">
                  {executionResult.rows.length} rows • {executionResult.executionTime}ms • {executionResult.rowsAffected} affected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  JSON
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </button>
              </div>
            </div>
          </div>

          {executionResult.rows.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {Object.keys(executionResult.rows[0]).map((column) => (
                        <th
                          key={column}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:bg-gray-700/50">
                        {Object.values(row).map((value: any, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"
                          >
                            {value === null || value === undefined ? (
                              <span className="text-gray-400 italic">NULL</span>
                            ) : typeof value === 'object' ? (
                              <span className="text-xs font-mono">{JSON.stringify(value)}</span>
                            ) : (
                              String(value)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {startIndex + 1} to {Math.min(endIndex, executionResult.rows.length)} of {executionResult.rows.length} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Query executed successfully but returned no rows.
            </div>
          )}
        </div>
      )}

      {/* Execution Error */}
      {executionError && (
        <div className="mt-6 bg-red-50 rounded-lg shadow p-6">
          <div className="flex items-start gap-3">
            <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Execution Failed</h3>
              <p className="text-sm text-red-700 font-mono whitespace-pre-wrap">{executionError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
