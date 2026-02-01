import React, { useState, useEffect } from 'react';
import apiClient from '../lib/api';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'smtp' | 'slack'>('smtp');
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '',
    secure: true,
    user: '',
    password: '',
    from: '',
  });
  const [slackConfig, setSlackConfig] = useState({
    webhookUrl: '',
    channel: '',
  });
  const [testEmail, setTestEmail] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load SMTP settings from environment or API if available
      const smtpFromEnv = {
        host: process.env.SMTP_HOST || '',
        port: process.env.SMTP_PORT || '587',
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        password: '',
        from: process.env.SMTP_FROM || '',
      };
      setSmtpConfig(smtpFromEnv);

      // Load Slack settings
      const slackFromEnv = {
        webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
        channel: process.env.SLACK_CHANNEL || '#general',
      };
      setSlackConfig(slackFromEnv);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveSMTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // In production, you'd send this to backend API to store in database
      // For now, we'll just show success and store in localStorage
      localStorage.setItem('smtp_config', JSON.stringify(smtpConfig));
      setMessage({ type: 'success', text: 'SMTP settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save SMTP settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMTP = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter a test email address' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiClient.post('/notifications/test-email', {
        to: testEmail,
        subject: 'Test Email from SQL Query Dashboard',
        html: '<h1>Test Email</h1><p>If you received this, your SMTP configuration is working!</p>',
      });
      setMessage({ type: 'success', text: 'Test email sent successfully! Check your inbox.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send test email' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSlack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      localStorage.setItem('slack_config', JSON.stringify(slackConfig));
      setMessage({ type: 'success', text: 'Slack settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save Slack settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSlack = async () => {
    if (!slackConfig.webhookUrl) {
      setMessage({ type: 'error', text: 'Please configure Slack webhook URL first' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiClient.post('/notifications/test-slack', {
        message: testMessage || 'Test notification from SQL Query Dashboard! 🚀',
      });
      setMessage({ type: 'success', text: 'Test notification sent to Slack successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send Slack notification' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('smtp')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'smtp'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Email (SMTP)
          </button>
          <button
            onClick={() => setActiveTab('slack')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'slack'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Slack
          </button>
        </nav>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* SMTP Tab */}
      {activeTab === 'smtp' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">SMTP Configuration</h2>
            <form onSubmit={handleSaveSMTP} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">SMTP Host</label>
                  <input
                    type="text"
                    required
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Port</label>
                  <input
                    type="number"
                    required
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                    placeholder="587"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="secure"
                  checked={smtpConfig.secure}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="secure" className="text-sm dark:text-gray-300">
                  Use TLS/SSL
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Username</label>
                <input
                  type="text"
                  required
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  placeholder="your-email@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  required
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  placeholder="Your app password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">From Email</label>
                <input
                  type="email"
                  required
                  value={smtpConfig.from}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
                  placeholder="notifications@yourcompany.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save SMTP Settings'}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Test Email</h2>
            <div className="flex gap-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleTestSMTP}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slack Tab */}
      {activeTab === 'slack' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Slack Configuration</h2>
            <form onSubmit={handleSaveSlack} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Webhook URL
                  <a
                    href="https://api.slack.com/messaging/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 dark:text-blue-400 text-xs"
                  >
                    (How to create?)
                  </a>
                </label>
                <input
                  type="url"
                  required
                  value={slackConfig.webhookUrl}
                  onChange={(e) => setSlackConfig({ ...slackConfig, webhookUrl: e.target.value })}
                  placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Default Channel (optional)
                </label>
                <input
                  type="text"
                  value={slackConfig.channel}
                  onChange={(e) => setSlackConfig({ ...slackConfig, channel: e.target.value })}
                  placeholder="#general"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Slack Settings'}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Test Slack Notification</h2>
            <div className="space-y-4">
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Test message (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleTestSlack}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Test Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
