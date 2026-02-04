import { Link } from 'react-router-dom';
import { Code2, Server, Key, CheckCircle2, ArrowRight, Terminal, Book, Zap, ArrowLeft } from 'lucide-react';

export default function APIIntegrationGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-white/80 hover:text-white transition mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-3 mb-4">
            <Code2 className="w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-bold">API Integration Guide</h1>
          </div>
          <p className="text-xl text-cyan-100">
            Integrate SQLPulse into your applications using our RESTful API and webhooks
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-cyan-50 dark:bg-cyan-900/20 border-l-4 border-cyan-600 p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <Server className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Powerful REST API
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Access all SQLPulse features programmatically. Execute queries, manage schedules, retrieve results, 
                and more - all through our comprehensive REST API.
              </p>
            </div>
          </div>
        </div>

        {/* API Base URL */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            API Base URL
          </h2>
          <div className="bg-gray-800 text-gray-100 p-4 rounded-lg font-mono mb-4">
            <code>https://sqlpulse.mahiiyh.me/api</code>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            All API requests should be made to this base URL with appropriate endpoints appended.
          </p>
        </div>

        {/* Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Key className="w-6 h-6 mr-2" />
            Authentication
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            SQLPulse API uses JWT (JSON Web Tokens) for authentication. Include your token in the Authorization header of all requests.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">1. Register/Login to Get Token</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">POST /api/auth/login</p>
                <pre className="bg-gray-800 text-gray-100 p-4 rounded text-sm overflow-x-auto"><code>{`{
  "email": "your-email@example.com",
  "password": "your-password"
}`}</code></pre>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 mb-2">Response:</p>
                <pre className="bg-gray-800 text-gray-100 p-4 rounded text-sm overflow-x-auto"><code>{`{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "your-email@example.com",
      "role": "developer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}`}</code></pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">2. Use Token in Requests</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Include in Authorization header:</p>
                <pre className="bg-gray-800 text-gray-100 p-4 rounded text-sm overflow-x-auto"><code>{`Authorization: Bearer YOUR_JWT_TOKEN_HERE`}</code></pre>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-4">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">🔒 Security Note</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Keep your JWT token secure. Never commit it to version control or expose it in client-side code. 
                Tokens expire after 7 days by default.
              </p>
            </div>
          </div>
        </div>

        {/* Core API Endpoints */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Core API Endpoints
          </h2>

          <div className="space-y-6">
            {/* Queries */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">📝 Queries</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-blue-600 dark:text-blue-400">GET /api/queries</code>
                    <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded">Public</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">List all queries (filtered by permissions)</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-blue-600 dark:text-blue-400">GET /api/queries/:id</code>
                    <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded">Public</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get specific query by ID</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-blue-600 dark:text-blue-400">POST /api/queries</code>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">Auth Required</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Create a new query</p>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto"><code>{`{
  "name": "Daily Active Users",
  "sql_content": "SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL '1 day'",
  "database_type": "postgresql",
  "category": "analytics",
  "description": "Count users active in last 24 hours",
  "is_public": false
}`}</code></pre>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-blue-600 dark:text-blue-400">POST /api/queries/:id/execute</code>
                    <span className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 px-2 py-1 rounded">Execute</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Execute a query</p>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto"><code>{`{
  "connection_id": 1,
  "parameters": {
    "date_from": "2026-01-01",
    "limit": 100
  }
}`}</code></pre>
                </div>
              </div>
            </div>

            {/* Connections */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">🔌 Connections</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-blue-600 dark:text-blue-400">GET /api/connections</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">List all database connections</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-blue-600 dark:text-blue-400">POST /api/connections</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-3">Create new database connection</p>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto"><code>{`{
  "name": "Production PostgreSQL",
  "type": "postgresql",
  "host": "db.example.com",
  "port": 5432,
  "database": "production_db",
  "username": "db_user",
  "password": "secure_password",
  "ssl": true
}`}</code></pre>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-blue-600 dark:text-blue-400">POST /api/connections/:id/test</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Test connection before saving</p>
                </div>
              </div>
            </div>

            {/* Schedules */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">⏰ Schedules</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-blue-600 dark:text-blue-400">GET /api/schedules</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">List all schedules</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-blue-600 dark:text-blue-400">POST /api/schedules</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-3">Create new schedule</p>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-x-auto"><code>{`{
  "query_id": 1,
  "connection_id": 1,
  "cron_expression": "0 9 * * *",
  "is_active": true,
  "notify_on_success": false,
  "notify_on_failure": true
}`}</code></pre>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-blue-600 dark:text-blue-400">PUT /api/schedules/:id</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Update schedule (enable/disable, change timing)</p>
                </div>
              </div>
            </div>

            {/* Execution History */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">📊 Execution History</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-blue-600 dark:text-blue-400">GET /api/history</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Get execution history with filters</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Query params: ?limit=50&offset=0&status=success&query_id=1</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-blue-600 dark:text-blue-400">GET /api/history/:id</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Get specific execution details with results</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <code className="text-blue-600 dark:text-blue-400">GET /api/history/stats</code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Get execution statistics (success rate, avg duration, etc.)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Terminal className="w-6 h-6 mr-2" />
            Code Examples
          </h2>

          <div className="space-y-6">
            {/* JavaScript/Node.js */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">JavaScript / Node.js</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto"><code>{`const axios = require('axios');

const API_URL = 'https://sqlpulse.mahiiyh.me/api';
const TOKEN = 'your-jwt-token';

// Execute a query
async function executeQuery(queryId, connectionId) {
  try {
    const response = await axios.post(
      \`\${API_URL}/queries/\${queryId}/execute\`,
      {
        connection_id: connectionId,
        parameters: {
          date_from: '2026-01-01'
        }
      },
      {
        headers: {
          'Authorization': \`Bearer \${TOKEN}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Query Results:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Create a schedule
async function createSchedule(queryId, connectionId, cronExpression) {
  const response = await axios.post(
    \`\${API_URL}/schedules\`,
    {
      query_id: queryId,
      connection_id: connectionId,
      cron_expression: cronExpression,
      is_active: true,
      notify_on_failure: true
    },
    {
      headers: {
        'Authorization': \`Bearer \${TOKEN}\`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

executeQuery(1, 1);`}</code></pre>
            </div>

            {/* Python */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Python</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto"><code>{`import requests
import json

API_URL = 'https://sqlpulse.mahiiyh.me/api'
TOKEN = 'your-jwt-token'

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

# Execute a query
def execute_query(query_id, connection_id):
    url = f'{API_URL}/queries/{query_id}/execute'
    payload = {
        'connection_id': connection_id,
        'parameters': {
            'date_from': '2026-01-01'
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        print('Query Results:', response.json())
        return response.json()
    else:
        print('Error:', response.status_code, response.text)

# Get execution history
def get_execution_history(limit=50):
    url = f'{API_URL}/history'
    params = {'limit': limit, 'status': 'success'}
    
    response = requests.get(url, headers=headers, params=params)
    return response.json()

execute_query(1, 1)`}</code></pre>
            </div>

            {/* cURL */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">cURL</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto"><code>{`# Login to get token
curl -X POST https://sqlpulse.mahiiyh.me/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"your-email@example.com","password":"your-password"}'

# Execute query
curl -X POST https://sqlpulse.mahiiyh.me/api/queries/1/execute \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"connection_id":1,"parameters":{"limit":100}}'

# Get execution history
curl -X GET "https://sqlpulse.mahiiyh.me/api/history?limit=50&status=success" \\
  -H "Authorization: Bearer YOUR_TOKEN"`}</code></pre>
            </div>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Zap className="w-6 h-6 mr-2" />
            Webhooks (Coming Soon)
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Receive real-time notifications about query executions, schedule events, and more.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Webhook Events:</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                <code className="text-sm">query.executed</code> - Query execution completed
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                <code className="text-sm">query.failed</code> - Query execution failed
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                <code className="text-sm">schedule.triggered</code> - Scheduled query started
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                <code className="text-sm">connection.tested</code> - Database connection test result
              </li>
            </ul>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ✅ API Best Practices
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Use environment variables for tokens</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Never hardcode API tokens in your source code. Use environment variables or secure vaults.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Implement error handling</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Always handle API errors gracefully. Check status codes and parse error messages.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Respect rate limits</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Currently: 100 requests per 15 minutes. Implement exponential backoff for retries.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Use HTTPS only</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  All API requests must use HTTPS. HTTP requests will be rejected.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Monitor API usage</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Track your API calls and query execution times in your application monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Integrate?
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-lg font-semibold transition"
            >
              <span>Get API Access</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <a 
              href="https://github.com/mahiiyh/sqlpulse#api-documentation" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-cyan-500 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-lg font-semibold transition"
            >
              <Book className="w-5 h-5" />
              <span>Full API Docs</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
