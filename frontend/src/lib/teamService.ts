import api from './api';

export interface Team {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  userRole: 'owner' | 'admin' | 'member';
  members?: TeamMember[];
  creator?: {
    id: number;
    email: string;
    username: string;
  };
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user?: {
    id: number;
    email: string;
    username: string;
  };
}

export interface TeamInvitation {
  id: number;
  team_id: number;
  inviter_id: number;
  invitee_email: string;
  invitee_id: number | null;
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  responded_at: string | null;
  team?: {
    id: number;
    name: string;
    description: string | null;
    creator?: {
      id: number;
      email: string;
      username: string;
    };
  };
  inviter?: {
    id: number;
    email: string;
    username: string;
  };
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

export const teamService = {
  // Team CRUD
  getTeams: async (): Promise<Team[]> => {
    const response = await api.get('/teams');
    return response.data.data;
  },

  getTeam: async (id: number): Promise<Team> => {
    const response = await api.get(`/teams/${id}`);
    return response.data.data;
  },

  createTeam: async (data: { name: string; description?: string }): Promise<Team> => {
    const response = await api.post('/teams', data);
    return response.data.data;
  },

  updateTeam: async (id: number, data: { name?: string; description?: string }): Promise<Team> => {
    const response = await api.put(`/teams/${id}`, data);
    return response.data.data;
  },

  deleteTeam: async (id: number): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get('/teams/search-users', { params: { q: query } });
    return response.data.data;
  },

  // Invitations
  sendInvitation: async (teamId: number, userEmail: string): Promise<TeamInvitation> => {
    const response = await api.post(`/teams/${teamId}/invite`, { userEmail });
    return response.data.data;
  },

  getMyInvitations: async (): Promise<TeamInvitation[]> => {
    const response = await api.get('/teams/invitations');
    return response.data.data;
  },

  acceptInvitation: async (invitationId: number): Promise<void> => {
    await api.post(`/teams/invitations/${invitationId}/accept`);
  },

  declineInvitation: async (invitationId: number): Promise<void> => {
    await api.post(`/teams/invitations/${invitationId}/decline`);
  },

  // Member management
  addMember: async (teamId: number, userEmail: string, role: 'owner' | 'admin' | 'member' = 'member'): Promise<TeamMember> => {
    const response = await api.post(`/teams/${teamId}/members`, { userEmail, role });
    return response.data.data;
  },

  updateMemberRole: async (teamId: number, memberId: number, role: 'owner' | 'admin' | 'member'): Promise<TeamMember> => {
    const response = await api.put(`/teams/${teamId}/members/${memberId}`, { role });
    return response.data.data;
  },

  removeMember: async (teamId: number, memberId: number): Promise<void> => {
    await api.delete(`/teams/${teamId}/members/${memberId}`);
  },

  // Resource sharing
  shareConnection: async (teamId: number, connectionId: number): Promise<void> => {
    await api.post(`/teams/${teamId}/connections`, { connectionId });
  },

  unshareConnection: async (teamId: number, connectionId: number): Promise<void> => {
    await api.delete(`/teams/${teamId}/connections/${connectionId}`);
  },

  shareQuery: async (teamId: number, queryId: number): Promise<void> => {
    await api.post(`/teams/${teamId}/queries`, { queryId });
  },

  unshareQuery: async (teamId: number, queryId: number): Promise<void> => {
    await api.delete(`/teams/${teamId}/queries/${queryId}`);
  },
};
