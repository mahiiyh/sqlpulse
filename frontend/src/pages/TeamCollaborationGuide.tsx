import { Link } from 'react-router-dom';
import { Users, UserPlus, Shield, Share2, CheckCircle2, ArrowRight, Mail, Lock, Star } from 'lucide-react';

export default function TeamCollaborationGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Team Collaboration Guide</h1>
          </div>
          <p className="text-xl text-emerald-100">
            Set up user roles, permissions, and shared query libraries for your team
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-600 p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <Share2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Collaborate Seamlessly
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                SQLPulse makes team collaboration easy. Share queries, database connections, and schedules with your team 
                while maintaining fine-grained access control.
              </p>
            </div>
          </div>
        </div>

        {/* Team Features Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Team Features Overview
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Share2 className="w-5 h-5 mr-2" />
                Resource Sharing
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Share queries with team members</li>
                <li>• Share database connections</li>
                <li>• Shared query templates library</li>
                <li>• Collaborative query editing</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Access Control
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Role-based permissions (RBAC)</li>
                <li>• Admin, Developer, Analyst, Read-only roles</li>
                <li>• Resource-level permissions</li>
                <li>• Audit logs for tracking changes</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Team Management
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Invite members via email</li>
                <li>• Assign roles and permissions</li>
                <li>• Remove or suspend members</li>
                <li>• View member activity</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Notifications
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Team-wide announcements</li>
                <li>• Query execution alerts</li>
                <li>• Scheduled query notifications</li>
                <li>• Slack/Teams integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Creating a Team */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">1</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Creating Your Team
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Start collaborating by creating a team workspace for your organization or project.
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Steps to Create a Team:</h3>
              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li>Navigate to <strong>Teams</strong> in the sidebar</li>
                <li>Click <strong>"Create Team"</strong> button</li>
                <li>Enter team details:
                  <ul className="ml-8 mt-2 space-y-1 list-disc">
                    <li>Team name (e.g., "Data Science Team")</li>
                    <li>Description (optional, helps members understand the team's purpose)</li>
                  </ul>
                </li>
                <li>Click <strong>"Create"</strong> - You're automatically assigned as the team owner/admin</li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 <strong>Tip:</strong> Use descriptive team names like "Analytics Team" or "Backend Engineers" 
                rather than generic names like "Team 1"
              </p>
            </div>
          </div>
        </div>

        {/* Inviting Members */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">2</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <UserPlus className="w-6 h-6 mr-2" />
                Inviting Team Members
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
              Add members to your team and assign appropriate roles based on their responsibilities.
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">How to Invite Members:</h3>
              <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
                <li>Open your team page</li>
                <li>Click <strong>"Invite Member"</strong></li>
                <li>Enter the member's email address or username</li>
                <li>Select their role (see roles below)</li>
                <li>Add a personal message (optional)</li>
                <li>Click <strong>"Send Invitation"</strong></li>
              </ol>

              <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">The invited member will receive:</p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc ml-5">
                  <li>Email notification with invitation link</li>
                  <li>In-app notification</li>
                  <li>Ability to accept or decline invitation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Understanding Roles */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Understanding User Roles
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            SQLPulse uses role-based access control (RBAC) to manage permissions. Choose the right role for each team member.
          </p>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-lg border-l-4 border-red-500">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Star className="w-5 h-5 mr-2 text-red-600" />
                  Admin
                </h3>
                <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-3 py-1 rounded-full font-medium">
                  Full Access
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Complete control over the platform. Can manage users, teams, and all resources.
              </p>
              <details className="text-sm">
                <summary className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-red-600">
                  View Permissions
                </summary>
                <ul className="mt-3 space-y-1 text-gray-700 dark:text-gray-300 ml-4 list-disc">
                  <li>Create, edit, delete all queries and connections</li>
                  <li>Manage all schedules</li>
                  <li>Add/remove team members</li>
                  <li>Assign roles and permissions</li>
                  <li>View all execution history</li>
                  <li>Access system settings</li>
                  <li>Delete teams</li>
                </ul>
              </details>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Developer</h3>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                  Create & Execute
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Can create and execute queries, manage connections, and create schedules.
              </p>
              <details className="text-sm">
                <summary className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600">
                  View Permissions
                </summary>
                <ul className="mt-3 space-y-1 text-gray-700 dark:text-gray-300 ml-4 list-disc">
                  <li>Create, edit, delete own queries</li>
                  <li>Create and test database connections</li>
                  <li>Execute any query they have access to</li>
                  <li>Create and manage schedules</li>
                  <li>Share queries with team</li>
                  <li>View own execution history</li>
                </ul>
              </details>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyst</h3>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full font-medium">
                  Create & View
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Can create and execute queries but cannot manage connections or infrastructure.
              </p>
              <details className="text-sm">
                <summary className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-purple-600">
                  View Permissions
                </summary>
                <ul className="mt-3 space-y-1 text-gray-700 dark:text-gray-300 ml-4 list-disc">
                  <li>Create, edit, delete own queries</li>
                  <li>Execute queries using existing connections</li>
                  <li>View shared queries and templates</li>
                  <li>View execution history</li>
                  <li>Export query results</li>
                  <li>Cannot create connections or schedules</li>
                </ul>
              </details>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/20 dark:to-slate-700/20 p-6 rounded-lg border-l-4 border-gray-500">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Read-Only</h3>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
                  View Only
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Can only view queries and results. Cannot create or execute anything.
              </p>
              <details className="text-sm">
                <summary className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-gray-600">
                  View Permissions
                </summary>
                <ul className="mt-3 space-y-1 text-gray-700 dark:text-gray-300 ml-4 list-disc">
                  <li>View shared queries (cannot edit)</li>
                  <li>View execution history and results</li>
                  <li>View dashboards and analytics</li>
                  <li>Cannot create, edit, or execute anything</li>
                  <li>Perfect for stakeholders and viewers</li>
                </ul>
              </details>
            </div>
          </div>
        </div>

        {/* Sharing Resources */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Share2 className="w-6 h-6 mr-2" />
            Sharing Queries and Connections
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sharing Queries</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Share individual queries or entire query libraries with your team.
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">How to Share a Query:</h4>
                <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700 dark:text-gray-300">
                  <li>Open the query you want to share</li>
                  <li>Click the <strong>"Share"</strong> button</li>
                  <li>Select your team from the dropdown</li>
                  <li>Choose permission level:
                    <ul className="ml-8 mt-1 space-y-1 list-disc">
                      <li><strong>View:</strong> Team members can see and execute</li>
                      <li><strong>Edit:</strong> Team members can modify the query</li>
                    </ul>
                  </li>
                  <li>Click <strong>"Share with Team"</strong></li>
                </ol>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 <strong>Tip:</strong> Mark queries as "Public" to share them with all team members automatically
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sharing Database Connections</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Share database connections securely with team members without exposing credentials.
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">How to Share a Connection:</h4>
                <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700 dark:text-gray-300">
                  <li>Go to <strong>Connections</strong> page</li>
                  <li>Click the connection you want to share</li>
                  <li>Click <strong>"Share with Team"</strong></li>
                  <li>Select team and permissions</li>
                  <li>Team members can now use this connection without seeing credentials</li>
                </ol>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-4">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Security Note
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Shared connections hide credentials from team members. Only admins can view/edit connection details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ✅ Team Collaboration Best Practices
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Follow principle of least privilege</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Give team members only the permissions they need. Start with read-only and upgrade as needed.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Use descriptive names for everything</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Name queries, connections, and teams clearly so everyone understands their purpose.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Regular permission audits</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Review team members and their permissions quarterly. Remove inactive members promptly.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Document query purposes</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Add descriptions to shared queries so team members understand when and how to use them.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Enable team notifications</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Set up Slack/Teams integration to keep everyone informed about important query executions.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-gray-900 dark:text-white">Create team query templates</strong>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Build a library of common queries as templates for consistent usage across the team.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Build Your Team?
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/teams" 
              className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold transition"
            >
              <Users className="w-5 h-5" />
              <span>Create Your Team</span>
            </Link>
            
            <Link 
              to="/getting-started" 
              className="inline-flex items-center justify-center space-x-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-500 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-lg font-semibold transition"
            >
              <span>Back to Getting Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
