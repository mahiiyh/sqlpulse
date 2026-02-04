import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamInvitation, teamService } from '../lib/teamService';
import Loader from '../components/Loader';

export default function Invitations() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const data = await teamService.getMyInvitations();
      setInvitations(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: number) => {
    try {
      setProcessingId(invitationId);
      await teamService.acceptInvitation(invitationId);
      fetchInvitations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId: number) => {
    try {
      setProcessingId(invitationId);
      await teamService.declineInvitation(invitationId);
      fetchInvitations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to decline invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Invitations</h1>
        <p className="text-gray-600 mt-1">Review and respond to team invitations</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No pending invitations</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any pending team invitations at the moment.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/teams')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Teams
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="bg-white rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {invitation.team?.name || 'Unknown Team'}
                    </h3>
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded-full">
                      Pending
                    </span>
                  </div>

                  {invitation.team?.description && (
                    <p className="text-sm text-gray-600 mt-2">{invitation.team.description}</p>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>
                        Invited by{' '}
                        <span className="font-medium">
                          {invitation.inviter?.username || invitation.inviter?.email}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{formatDate(invitation.invited_at)}</span>
                    </div>

                    {invitation.team?.creator && (
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-2 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        <span>
                          Team created by{' '}
                          <span className="font-medium">
                            {invitation.team.creator.username || invitation.team.creator.email}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleAccept(invitation.id)}
                    disabled={processingId === invitation.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === invitation.id ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleDecline(invitation.id)}
                    disabled={processingId === invitation.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
