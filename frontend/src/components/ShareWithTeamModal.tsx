import { useState, useEffect } from 'react';
import { teamService, Team } from '../lib/teamService';

interface ShareWithTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'connection' | 'query';
  resourceId: number;
  resourceName: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export default function ShareWithTeamModal({
  isOpen,
  onClose,
  resourceType,
  resourceId,
  resourceName,
  onSuccess,
  onError
}: ShareWithTeamModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTeams();
    }
  }, [isOpen]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (teamId: number, teamName: string) => {
    try {
      setSharing(teamId);
      if (resourceType === 'connection') {
        await teamService.shareConnection(teamId, resourceId);
      } else {
        await teamService.shareQuery(teamId, resourceId);
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error(`Failed to share ${resourceType}:`, error);
      const message = error.response?.data?.message || `Failed to share ${resourceType} with ${teamName}`;
      onError?.(message);
    } finally {
      setSharing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share "{resourceName}" with Team
          </h3>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You don't have any teams yet.</p>
              <p className="text-sm text-gray-400">Create a team first to share resources.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{team.name}</h4>
                    {team.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{team.description}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Your role: <span className="font-medium">{team.userRole}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleShare(team.id, team.name)}
                    disabled={sharing !== null || team.userRole === 'member'}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={team.userRole === 'member' ? 'Only owners and admins can share resources' : 'Share with this team'}
                  >
                    {sharing === team.id ? 'Sharing...' : 'Share'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
