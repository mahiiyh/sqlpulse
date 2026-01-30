import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../lib/api';

export default function QueryEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
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
    if (id) {
      fetchQuery();
    }
  }, [id]);

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

    setExecuting(true);
    setExecutionResult(null);

    try {
      const response = await apiClient.post(`/queries/${id}/execute`, {
        connection_id: 1 // TODO: Let user select connection
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
          <textarea
            required
            value={formData.sql_content}
            onChange={(e) => setFormData({ ...formData, sql_content: e.target.value })}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="SELECT * FROM table WHERE ..."
          />
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

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Query' : 'Create Query'}
          </button>
          {id && (
            <button
              type="button"
              onClick={handleExecute}
              disabled={executing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {executing ? 'Executing...' : '▶ Execute'}
            </button>
          )}
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
          <h3 className="text-lg font-semibold mb-4">
            {executionResult.success ? '✓ Execution Results' : '✗ Execution Error'}
          </h3>
          {executionResult.success ? (
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(executionResult.data, null, 2)}
              </pre>
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
