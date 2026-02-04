import { Link } from 'react-router-dom';
import { Play, Database, Zap, CheckCircle2, ArrowRight, Code2 } from 'lucide-react';

export default function GettingStarted() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <Play className="w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Getting Started with SQLPulse</h1>
          </div>
          <p className="text-xl text-blue-100">
            Set up your first database connection and run your first query in under 5 minutes
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Start Badge */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                5-Minute Quick Start
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Follow this guide to connect your first database, write a query, and see results in minutes.
                No complicated setup required!
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Sign Up */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Create Your Account
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sign up for a free SQLPulse account. No credit card required.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Registration Steps:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Navigate to <Link to="/register" className="text-blue-600 hover:underline">sqlpulse.mahiiyh.me/register</Link>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Enter your email, username, and secure password (min 8 characters)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Set your preferred timezone for accurate scheduling
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Click "Create Account" and you're instantly logged in
                    </span>
                  </li>
                </ul>
              </div>

              <Link 
                to="/register" 
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Step 2: Add Database Connection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Database className="w-6 h-6 mr-2" />
                Add Your First Database Connection
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect SQLPulse to your database. We support PostgreSQL, MySQL, SQL Server, and more.
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Connection Setup:</h3>
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="text-gray-700 dark:text-gray-300">
                    Go to <strong>Connections</strong> in the sidebar
                  </li>
                  <li className="text-gray-700 dark:text-gray-300">
                    Click <strong>"New Connection"</strong> button
                  </li>
                  <li className="text-gray-700 dark:text-gray-300">
                    Fill in connection details:
                    <ul className="ml-6 mt-2 space-y-1 list-disc">
                      <li><strong>Name:</strong> Give it a memorable name (e.g., "Production DB")</li>
                      <li><strong>Type:</strong> Select your database type (PostgreSQL, MySQL, etc.)</li>
                      <li><strong>Host:</strong> Database server address</li>
                      <li><strong>Port:</strong> Default ports are pre-filled</li>
                      <li><strong>Database:</strong> Database name</li>
                      <li><strong>Credentials:</strong> Username and password</li>
                    </ul>
                  </li>
                  <li className="text-gray-700 dark:text-gray-300">
                    Click <strong>"Test Connection"</strong> to verify
                  </li>
                  <li className="text-gray-700 dark:text-gray-300">
                    Save when test is successful ✓
                  </li>
                </ol>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-4 mb-4">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">🔒 Security Note</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  All connection credentials are encrypted using AES-256 encryption before storage. 
                  SSL/TLS connections are supported and recommended for production databases.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Write Your First Query */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Code2 className="w-6 h-6 mr-2" />
                Write and Execute Your First Query
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Use our advanced query editor to write and execute SQL queries with syntax highlighting and auto-completion.
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Query Steps:</h3>
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="text-gray-700 dark:text-gray-300">
                    Navigate to <strong>Query Library</strong> or click <strong>"New Query"</strong>
                  </li>
                  <li className="text-gray-700 dark:text-gray-300">
                    Select your database connection from the dropdown
                  </li>
                  <li className="text-gray-700 dark:text-gray-300">
                    Write your SQL query in the editor. Try this sample:
                    <div className="mt-2 bg-gray-800 text-gray-100 p-4 rounded-lg font-mono text-sm">
                      <code>
                        SELECT * FROM users<br />
                        WHERE created_at {'>'} NOW() - INTERVAL '7 days'<br />
                        ORDER BY created_at DESC<br />
                        LIMIT 10;
                      </code>
                    </div>
                  </li>
                  <li className="text-gray-700 dark:text-gray-300">
                    Click <strong>"Execute"</strong> (or press Ctrl+Enter / Cmd+Enter)
                  </li>
                  <li className="text-gray-700 dark:text-gray-300">
                    View results in the table below
                  </li>
                  <li className="text-gray-700 dark:text-gray-300">
                    Save the query for future use
                  </li>
                </ol>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✨ Editor Features</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Syntax highlighting</li>
                    <li>• Auto-completion</li>
                    <li>• Query formatting</li>
                    <li>• Parameterized queries</li>
                  </ul>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Result Options</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Export to CSV/Excel/JSON</li>
                    <li>• Copy to clipboard</li>
                    <li>• View execution time</li>
                    <li>• See row count</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🎉 Congratulations! What's Next?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link 
              to="/query-scheduling-guide" 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-transparent hover:border-blue-500 transition group"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition">
                Schedule Recurring Queries
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Learn how to automate queries with cron expressions
              </p>
              <span className="text-blue-600 text-sm font-medium flex items-center">
                Read Guide <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>

            <Link 
              to="/team-collaboration-guide" 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-transparent hover:border-blue-500 transition group"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition">
                Collaborate with Your Team
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Share queries and manage team permissions
              </p>
              <span className="text-blue-600 text-sm font-medium flex items-center">
                Read Guide <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>

            <Link 
              to="/api-integration-guide" 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-transparent hover:border-blue-500 transition group"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition">
                Integrate via API
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Use our RESTful API in your applications
              </p>
              <span className="text-blue-600 text-sm font-medium flex items-center">
                Read Guide <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>

            <Link 
              to="/templates" 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-transparent hover:border-blue-500 transition group"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition">
                Browse Query Templates
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Start with pre-built query templates
              </p>
              <span className="text-blue-600 text-sm font-medium flex items-center">
                View Templates <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Need Help?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Check out our documentation or reach out to the community
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="https://github.com/mahiiyh/sqlpulse#readme" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              View Documentation
            </a>
            <a 
              href="https://github.com/mahiiyh/sqlpulse/discussions" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg font-medium transition"
            >
              Join Community
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
