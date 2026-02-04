import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Team, TeamMember, User, teamService } from '../lib/teamService';
import apiClient from '../lib/api';
import Loader from '../components/Loader';

interface Connection {
  id: number;
  name: string;
  type: string;
  environment: string;
  created_by: number;
}

interface Query {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  created_by: number;
}

export default function TeamDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'connections' | 'queries'>('members');

  // Member management state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Resource sharing state
  const [showShareConnectionModal, setShowShareConnectionModal] = useState(false);
  const [showShareQueryModal, setShowShareQueryModal] = useState(false);
  const [availableConnections, setAvailableConnections] = useState<Connection[]>([]);
  const [availableQueries, setAvailableQueries] = useState<Query[]>([]);
  const [sharedConnections, setSharedConnections] = useState<Connection[]>([]);
  const [sharedQueries, setSharedQueries] = useState<Query[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Edit team state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });

  const teamId = parseInt(id || '0');

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails();
    }
  }, [teamId]);

  useEffect(() => {
    if (activeTab === 'connections') {
      fetchConnections();
    } else if (activeTab === 'queries') {
      fetchQueries();
    }
  }, [activeTab]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeam(teamId);
      setTeam(data);
      setEditFormData({ name: data.name, description: data.description || '' });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch team details');
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      setLoadingResources(true);
      
      // Fetch all user's connections
      const allConnsResponse = await apiClient.get('/connections');
      const allConns = allConnsResponse.data.data || [];
      setAvailableConnections(allConns);

      // Fetch team-shared connections
      const sharedResponse = await apiClient.get(`/teams/${teamId}/connections`);
      setSharedConnections(sharedResponse.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchQueries = async () => {
    try {
      setLoadingResources(true);
      
      // Fetch all user's queries
      const allQueriesResponse = await apiClient.get('/queries');
      const allQueries = allQueriesResponse.data.data || [];
      setAvailableQueries(allQueries);

      // Fetch team-shared queries
      const sharedResponse = await apiClient.get(`/teams/${teamId}/queries`);
      setSharedQueries(sharedResponse.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch queries:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await teamService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleInviteUser = async (userEmail: string) => {
    try {
      setInviting(true);
      await teamService.sendInvitation(teamId, userEmail);
      alert('Invitation sent successfully!');
      setShowInviteModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await teamService.removeMember(teamId, memberId);
      fetchTeamDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: 'owner' | 'admin' | 'member') => {
    try {
      await teamService.updateMemberRole(teamId, memberId, newRole);
      fetchTeamDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleShareConnection = async (connectionId: number) => {
    try {
      await teamService.shareConnection(teamId, connectionId);
      setShowShareConnectionModal(false);
      fetchConnections();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to share connection');
    }
  };

  const handleUnshareConnection = async (connectionId: number) => {
    if (!confirm('Remove this connection from the team?')) return;

    try {
      await teamService.unshareConnection(teamId, connectionId);
      fetchConnections();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to unshare connection');
    }
  };

  const handleShareQuery = async (queryId: number) => {
    try {
      await teamService.shareQuery(teamId, queryId);
      setShowShareQueryModal(false);
      fetchQueries();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to share query');
    }
  };

  const handleUnshareQuery = async (queryId: number) => {
    if (!confirm('Remove this query from the team?')) return;

    try {
      await teamService.unshareQuery(teamId, queryId);
      fetchQueries();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to unshare query');
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teamService.updateTeam(teamId, editFormData);
      setShowEditModal(false);
      fetchTeamDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update team');
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      await teamService.deleteTeam(teamId);
      navigate('/teams');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete team');
    }
  };

  const canManageMembers = team?.userRole === 'owner' || team?.userRole === 'admin';
  const canManageTeam = team?.userRole === 'owner';
  const canInvite = team?.userRole !== undefined; // All members can invite

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Team not found'}</p>
        <button
          onClick={() => navigate('/teams')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Teams
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                  team.userRole
                )}`}
              >
                {team.userRole}
              </span>
            </div>
            {team.description && <p className="text-gray-600 dark:text-gray-400 mt-2">{team.description}</p>}
            {team.creator && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Created by {team.creator.username} on{' '}
                {new Date(team.created_at).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            {canManageTeam && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteTeam}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={() => navigate('/teams')}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
            }`}
          >
            Members ({team.members?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'connections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
            }`}
          >
            Shared Connections ({sharedConnections.length})
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'queries'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
            }`}
          >
            Shared Queries ({sharedQueries.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
              {canInvite && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Invite Member
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {team.members?.map((member) => (
                <div key={member.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.user?.username || member.user?.email}
                    </p>
                    <p className="text-sm text-gray-500">{member.user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {canManageMembers && member.role !== 'owner' ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleUpdateRole(member.id, e.target.value as 'owner' | 'admin' | 'member')
                        }
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        {canManageTeam && <option value="owner">Owner</option>}
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                    )}

                    {canManageMembers && member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shared Connections</h2>
              {canManageMembers && (
                <button
                  onClick={() => setShowShareConnectionModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Share Connection
                </button>
              )}
            </div>

            {loadingResources ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : sharedConnections.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No connections shared with this team yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                {sharedConnections.map((conn) => (
                  <div key={conn.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{conn.name}</p>
                      <p className="text-sm text-gray-500">
                        {conn.type} • {conn.environment}
                      </p>
                    </div>
                    {canManageMembers && (
                      <button
                        onClick={() => handleUnshareConnection(conn.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Unshare
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Queries Tab */}
        {activeTab === 'queries' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shared Queries</h2>
              {canManageMembers && (
                <button
                  onClick={() => setShowShareQueryModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Share Query
                </button>
              )}
            </div>

            {loadingResources ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : sharedQueries.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No queries shared with this team yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                {sharedQueries.map((query) => (
                  <div key={query.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{query.name}</p>
                      {query.description && (
                        <p className="text-sm text-gray-500">{query.description}</p>
                      )}
                    </div>
                    {canManageMembers && (
                      <button
                        onClick={() => handleUnshareQuery(query.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Unshare
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Invite Team Member</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                  placeholder="Search by email or username..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearchUsers}
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div key={user.id} className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleInviteUser(user.email)}
                        disabled={inviting}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Connection Modal */}
      {showShareConnectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share Connection</h2>
            
            {availableConnections.length === 0 ? (
              <p className="text-gray-500">No connections available to share.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableConnections
                  .filter((conn) => !sharedConnections.some((sc) => sc.id === conn.id))
                  .map((conn) => (
                    <div
                      key={conn.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
                      onClick={() => handleShareConnection(conn.id)}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{conn.name}</p>
                      <p className="text-sm text-gray-500">
                        {conn.type} • {conn.environment}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowShareConnectionModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Query Modal */}
      {showShareQueryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share Query</h2>
            
            {availableQueries.length === 0 ? (
              <p className="text-gray-500">No queries available to share.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableQueries
                  .filter((query) => !sharedQueries.some((sq) => sq.id === query.id))
                  .map((query) => (
                    <div
                      key={query.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
                      onClick={() => handleShareQuery(query.id)}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{query.name}</p>
                      {query.description && (
                        <p className="text-sm text-gray-500">{query.description}</p>
                      )}
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowShareQueryModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Team</h2>
            <form onSubmit={handleUpdateTeam}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
