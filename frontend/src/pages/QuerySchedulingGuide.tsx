import { Link } from 'react-router-dom';
import { Clock, Calendar, Zap, Bell, CheckCircle2, ArrowRight, Code2, Play, Repeat } from 'lucide-react';

export default function QuerySchedulingGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Query Scheduling Guide</h1>
          </div>
          <p className="text-xl text-purple-100">
            Learn how to schedule recurring queries using cron expressions and manage automated workflows
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-600 p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Automate Your Database Tasks
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Schedule queries to run automatically at specific times or intervals. Perfect for reports, 
                data exports, backups, and maintenance tasks.
              </p>
            </div>
          </div>
        </div>

        {/* What is Query Scheduling */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            What is Query Scheduling?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Query scheduling allows you to execute SQL queries automatically at predefined times or intervals. 
            Instead of running queries manually, you can set them to run:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Daily reports</strong> - Generate and email reports every morning
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Hourly data syncs</strong> - Keep systems synchronized automatically
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Weekly backups</strong> - Export data every Sunday at midnight
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Monthly maintenance</strong> - Run cleanup tasks on the first of every month
              </span>
            </li>
          </ul>
        </div>

        {/* Creating a Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Creating a Schedule
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Step-by-Step Instructions:</h3>
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Navigate to Schedules</strong>
                  <p className="ml-6 mt-1 text-sm">Click "Schedules" in the sidebar</p>
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Click "New Schedule"</strong>
                  <p className="ml-6 mt-1 text-sm">Opens the schedule creation modal</p>
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Select Your Query</strong>
                  <p className="ml-6 mt-1 text-sm">Choose from your saved queries or create a new one</p>
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Choose Database Connection</strong>
                  <p className="ml-6 mt-1 text-sm">Select which database to run the query against</p>
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Set Schedule Type</strong>
                  <p className="ml-6 mt-1 text-sm">Choose interval (e.g., hourly, daily) or use custom cron expression</p>
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Configure Notifications</strong>
                  <p className="ml-6 mt-1 text-sm">Get notified on success, failure, or both via email/Slack</p>
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <strong>Save and Activate</strong>
                  <p className="ml-6 mt-1 text-sm">Your query will run automatically according to the schedule</p>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Understanding Cron Expressions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Code2 className="w-6 h-6 mr-2" />
            Understanding Cron Expressions
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Cron expressions provide powerful, flexible scheduling. They consist of 5 or 6 fields representing time units:
          </p>

          <div className="bg-gray-800 text-gray-100 p-6 rounded-lg font-mono text-sm mb-6">
            <div className="mb-2">
              <code>* * * * *</code>
            </div>
            <div className="text-gray-400 text-xs space-y-1">
              <div>│ │ │ │ └── Day of week (0-7, Sunday=0 or 7)</div>
              <div>│ │ │ └──── Month (1-12)</div>
              <div>│ │ └────── Day of month (1-31)</div>
              <div>│ └──────── Hour (0-23)</div>
              <div>└────────── Minute (0-59)</div>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Common Cron Examples:</h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <code className="text-blue-600 dark:text-blue-400 font-mono">0 9 * * *</code>
                <span className="text-sm text-gray-600 dark:text-gray-400">Every day at 9:00 AM</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Perfect for daily morning reports</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <code className="text-blue-600 dark:text-blue-400 font-mono">*/15 * * * *</code>
                <span className="text-sm text-gray-600 dark:text-gray-400">Every 15 minutes</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Great for frequent data syncs</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <code className="text-blue-600 dark:text-blue-400 font-mono">0 0 * * 0</code>
                <span className="text-sm text-gray-600 dark:text-gray-400">Every Sunday at midnight</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ideal for weekly backups</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <code className="text-blue-600 dark:text-blue-400 font-mono">0 8-18 * * 1-5</code>
                <span className="text-sm text-gray-600 dark:text-gray-400">Hourly, weekdays, 8 AM - 6 PM</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Run during business hours only</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <code className="text-blue-600 dark:text-blue-400 font-mono">0 0 1 * *</code>
                <span className="text-sm text-gray-600 dark:text-gray-400">First day of every month at midnight</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Monthly maintenance tasks</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <code className="text-blue-600 dark:text-blue-400 font-mono">30 2 * * *</code>
                <span className="text-sm text-gray-600 dark:text-gray-400">Every day at 2:30 AM</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Low-traffic time for heavy queries</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Use <a href="https://crontab.guru" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">crontab.guru</a> to 
              validate and visualize your cron expressions before saving.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Bell className="w-6 h-6 mr-2" />
            Configuring Notifications
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Stay informed about your scheduled queries with automatic notifications.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📧 Email Notifications</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Success: Query completed successfully</li>
                <li>• Failure: Query failed with error details</li>
                <li>• Results: Include query results in email</li>
                <li>• Summary: Daily/weekly digest of all executions</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💬 Slack Integrations</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Post to specific channels</li>
                <li>• Rich formatted messages</li>
                <li>• Include execution metrics</li>
                <li>• @mention on failures</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">⚙️ Setup Required</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Configure SMTP settings or webhook URLs in <Link to="/settings" className="underline">Settings</Link> before 
              enabling notifications.
            </p>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Repeat className="w-6 h-6 mr-2" />
            Advanced Scheduling Features
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🔄 Automatic Retries</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Configure automatic retries for failed queries to handle temporary issues.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Set retry count (1-5 attempts)</li>
                  <li>• Define retry delay (exponential backoff supported)</li>
                  <li>• Notify only on final failure</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">⏱️ Timeout Configuration</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Prevent long-running queries from blocking the queue.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Default timeout: 30 minutes</li>
                  <li>• Configurable per schedule</li>
                  <li>• Automatic cancellation on timeout</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🎯 Parameterized Schedules</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Use dynamic parameters in scheduled queries for flexible execution.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <code className="text-sm text-gray-700 dark:text-gray-300">
                  SELECT * FROM orders<br />
                  WHERE created_at {'>'}= {'{{date_from}}'}<br />
                  AND created_at {'<'} {'{{date_to}}'}
                </code>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Parameters are evaluated at execution time (e.g., date_from = today - 7 days)
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📊 Execution History</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Track all scheduled executions with detailed history.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• View success/failure status</li>
                  <li>• Check execution duration</li>
                  <li>• Access query results</li>
                  <li>• Review error messages</li>
                  <li>• Export history data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ✅ Best Practices
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Test queries manually first</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Always test your query manually before scheduling to ensure it works correctly
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Use appropriate intervals</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Don't schedule too frequently - consider database load and data update frequency
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0-5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Enable failure notifications</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Get alerted immediately when scheduled queries fail
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Monitor execution history</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Regularly review execution history to catch issues early
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Use descriptive names</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Give schedules clear names like "Daily Sales Report" instead of "Schedule 1"
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Consider timezone settings</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Schedules use your account timezone - verify it's set correctly in Settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Schedule Your First Query?
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/schedules" 
              className="inline-flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition"
            >
              <Play className="w-5 h-5" />
              <span>Create Schedule</span>
            </Link>
            
            <Link 
              to="/api-integration-guide" 
              className="inline-flex items-center justify-center space-x-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-purple-500 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-lg font-semibold transition"
            >
              <span>Learn API Integration</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
