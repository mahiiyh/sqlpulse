import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
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
router.post('/', authorize('admin', 'developer'), createTeam);
router.get('/:id', getTeam);
router.put('/:id', authorize('admin', 'developer'), updateTeam);
router.delete('/:id', authorize('admin'), deleteTeam);

// Team invitations for specific team
router.post('/:id/invite', authorize('admin', 'developer'), sendInvitation);

// Member management
router.post('/:id/members', authorize('admin', 'developer'), addMember);
router.put('/:id/members/:memberId', authorize('admin', 'developer'), updateMemberRole);
router.delete('/:id/members/:memberId', authorize('admin', 'developer'), removeMember);

// Get team resources
router.get('/:id/connections', getTeamConnections);
router.get('/:id/queries', getTeamQueries);

// Resource sharing
router.post('/:id/connections', authorize('admin', 'developer'), shareConnection);
router.delete('/:id/connections/:connectionId', authorize('admin', 'developer'), unshareConnection);
router.post('/:id/queries', authorize('admin', 'developer', 'analyst'), shareQuery);
router.delete('/:id/queries/:queryId', authorize('admin', 'developer', 'analyst'), unshareQuery);

export default router;
