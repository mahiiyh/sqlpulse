import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  updateMemberRole,
  removeMember,
  shareConnection,
  unshareConnection,
  shareQuery,
  unshareQuery,
  sendInvitation,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
  searchUsers,
  getTeamConnections,
  getTeamQueries
} from '../controllers/team.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User search
router.get('/search-users', searchUsers);

// Team invitations
router.get('/invitations', getMyInvitations);
router.post('/invitations/:invitationId/accept', acceptInvitation);
router.post('/invitations/:invitationId/decline', declineInvitation);

// Team CRUD
router.get('/', getTeams);
router.post('/', createTeam);
router.get('/:id', getTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

// Team invitations for specific team
router.post('/:id/invite', sendInvitation);

// Member management
router.post('/:id/members', addMember);
router.put('/:id/members/:memberId', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);

// Get team resources
router.get('/:id/connections', getTeamConnections);
router.get('/:id/queries', getTeamQueries);

// Resource sharing
router.post('/:id/connections', shareConnection);
router.delete('/:id/connections/:connectionId', unshareConnection);
router.post('/:id/queries', shareQuery);
router.delete('/:id/queries/:queryId', unshareQuery);

export default router;
