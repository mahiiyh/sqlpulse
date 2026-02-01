import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';
import Loader from '../components/Loader';

interface QueryTemplate {
  id: number;
  name: string;
  description: string | null;
  sql_template: string;
  category: string;
  tags: string[];
  variables: Record<string, any> | null;
  creator: {
    id: number;
    username: string;
    email: string;
  };
  created_at: string;
}

const QueryTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<QueryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sql_template: '',
    category: 'General',
    tags: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, [search, categoryFilter]);

  const fetchTemplates = async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await apiClient.get(`/query-templates?${params}`);
      setTemplates(response.data.data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(response.data.data.map((t: QueryTemplate) => t.category))
      );
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      // Ensure loader shows for at least 500ms for better UX
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 500 - elapsedTime);
      setTimeout(() => setLoading(false), remainingTime);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/query-templates', {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        sql_template: '',
        category: 'General',
        tags: '',
      });
      fetchTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleUseTemplate = (template: QueryTemplate) => {
    // Navigate to query editor with template SQL
    navigate('/queries/new', { state: { sql: template.sql_template } });
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await apiClient.delete(`/query-templates/${id}`);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  if (loading) {
    return <Loader size="lg" text="Loading templates..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Query Templates</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {template.category}
              </span>
            </div>

            {template.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Created by {template.creator?.username || 'Unknown'} • {new Date(template.created_at).toLocaleDateString()}
            </div>

            <div className="mb-4">
              <code className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 p-2 rounded block overflow-x-auto">
                {template.sql_template.substring(0, 100)}
                {template.sql_template.length > 100 && '...'}
              </code>
            </div>

            {template.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleUseTemplate(template)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Use Template
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No templates found. Create your first template!
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Create Query Template</h2>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">SQL Template</label>
                <textarea
                  required
                  value={formData.sql_template}
                  onChange={(e) => setFormData({ ...formData, sql_template: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm dark:bg-gray-700 dark:text-white"
                  rows={8}
                  placeholder="SELECT * FROM {{table_name}} WHERE date >= '{{date_from}}'"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="reporting, sales, daily"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Template
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryTemplates;
