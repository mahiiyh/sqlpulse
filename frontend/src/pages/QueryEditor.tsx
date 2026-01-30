import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import apiClient from '../lib/api';

interface Connection {
  id: number;
  name: string;
  type: string;
  environment: string;
}

export default function QueryEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);
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
    }
  }, [id]);

  const fetchConnections = async () => {
    try {
      const response = await apiClient.get('/connections');
      setConnections(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedConnectionId(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
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
      } else {
        await apiClient.post('/queries', formData);
      }
      navigate('/queries');
    } catch (error) {
      console.error('Failed to save query:', error);
      alert('Failed to save query');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!id) {
      alert('Please save the query before executing');
      return;
    }

    if (!selectedConnectionId) {
      alert('Please select a connection');
      return;
    }

    setExecuting(true);
    setExecutionResult(null);

    try {
      const response = await apiClient.post(`/queries/${id}/execute`, {
        connection_id: selectedConnectionId
      });
      setExecutionResult({
        success: true,
        data: response.data
      });
    } catch (error: any) {
      setExecutionResult({
        success: false,
        error: error.response?.data?.message || 'Execution failed'
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Edit Query' : 'Create Query'}
        </h1>
        <p className="mt-2 text-gray-600">Define your SQL query and metadata</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Query Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SQL Content *
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
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
            <span className="text-sm text-gray-700">Public (visible to all users)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_dangerous}
              onChange={(e) => setFormData({ ...formData, is_dangerous: e.target.checked })}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Dangerous (requires extra confirmation)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_schedulable}
              onChange={(e) => setFormData({ ...formData, is_schedulable: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Schedulable</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {executionResult && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {executionResult.success ? '✓ Execution Results' : '✗ Execution Error'}
            </h3>
            {executionResult.success && executionResult.data.data && (
              <div className="text-sm text-gray-600">
                {executionResult.data.data.rows.length} rows • {executionResult.data.data.executionTime}ms
              </div>
            )}
          </div>
          {executionResult.success ? (
            <div>
              {executionResult.data.data.rows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(executionResult.data.data.rows[0]).map((key) => (
                          <th
                            key={key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {executionResult.data.data.rows.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          {Object.values(row).map((value: any, cellIdx: number) => (
                            <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {value !== null && value !== undefined ? String(value) : <span className="text-gray-400 italic">null</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center text-gray-500">
                  Query executed successfully but returned no rows
                </div>
              )}
              <div className="mt-4 flex gap-4 text-sm text-gray-600">
                <span>Rows affected: <strong>{executionResult.data.data.rowsAffected}</strong></span>
                <span>Execution time: <strong>{executionResult.data.data.executionTime}ms</strong></span>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700">
              {executionResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
