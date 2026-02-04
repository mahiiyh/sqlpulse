import User from './User';
import Connection from './Connection';
import Query from './Query';
import Schedule from './Schedule';
import ExecutionHistory from './ExecutionHistory';
import ScheduleDependency from './ScheduleDependency';
import QueryTemplate from './QueryTemplate';
import Team from './Team';
import TeamMember from './TeamMember';
import TeamConnection from './TeamConnection';
import TeamQuery from './TeamQuery';
import TeamInvitation from './TeamInvitation';

// Define associations
User.hasMany(Connection, { foreignKey: 'created_by', as: 'connections' });
Connection.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Query, { foreignKey: 'created_by', as: 'queries' });
Query.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(QueryTemplate, { foreignKey: 'created_by', as: 'templates' });
QueryTemplate.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Query.hasMany(Schedule, { foreignKey: 'query_id', as: 'schedules' });
Schedule.belongsTo(Query, { foreignKey: 'query_id', as: 'query' });

Connection.hasMany(Schedule, { foreignKey: 'connection_id', as: 'schedules' });
Schedule.belongsTo(Connection, { foreignKey: 'connection_id', as: 'connection' });

User.hasMany(Schedule, { foreignKey: 'created_by', as: 'createdSchedules' });
Schedule.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Query.hasMany(ExecutionHistory, { foreignKey: 'query_id', as: 'executions' });
ExecutionHistory.belongsTo(Query, { foreignKey: 'query_id', as: 'query' });

Schedule.hasMany(ExecutionHistory, { foreignKey: 'schedule_id', as: 'executions' });
ExecutionHistory.belongsTo(Schedule, { foreignKey: 'schedule_id', as: 'schedule' });

Connection.hasMany(ExecutionHistory, { foreignKey: 'connection_id', as: 'executions' });
ExecutionHistory.belongsTo(Connection, { foreignKey: 'connection_id', as: 'connection' });

// Schedule dependency associations
Schedule.hasMany(ScheduleDependency, { foreignKey: 'schedule_id', as: 'dependencies' });
Schedule.hasMany(ScheduleDependency, { foreignKey: 'depends_on_schedule_id', as: 'dependents' });
ScheduleDependency.belongsTo(Schedule, { foreignKey: 'schedule_id', as: 'schedule' });
ScheduleDependency.belongsTo(Schedule, { foreignKey: 'depends_on_schedule_id', as: 'dependsOnSchedule' });

User.hasMany(ExecutionHistory, { foreignKey: 'executed_by', as: 'executedQueries' });
ExecutionHistory.belongsTo(User, { foreignKey: 'executed_by', as: 'executor' });

// Team associations
User.hasMany(Team, { foreignKey: 'created_by', as: 'createdTeams' });
Team.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Team.hasMany(TeamMember, { foreignKey: 'team_id', as: 'members' });
TeamMember.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

User.hasMany(TeamMember, { foreignKey: 'user_id', as: 'teamMemberships' });
TeamMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Team.hasMany(TeamConnection, { foreignKey: 'team_id', as: 'sharedConnections' });
TeamConnection.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

Connection.hasMany(TeamConnection, { foreignKey: 'connection_id', as: 'teamShares' });
TeamConnection.belongsTo(Connection, { foreignKey: 'connection_id', as: 'connection' });

User.hasMany(TeamConnection, { foreignKey: 'shared_by', as: 'sharedConnections' });
TeamConnection.belongsTo(User, { foreignKey: 'shared_by', as: 'sharedBy' });

Team.hasMany(TeamQuery, { foreignKey: 'team_id', as: 'sharedQueries' });
TeamQuery.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

Query.hasMany(TeamQuery, { foreignKey: 'query_id', as: 'teamShares' });
TeamQuery.belongsTo(Query, { foreignKey: 'query_id', as: 'query' });

User.hasMany(TeamQuery, { foreignKey: 'shared_by', as: 'sharedQueries' });
TeamQuery.belongsTo(User, { foreignKey: 'shared_by', as: 'sharedBy' });

// Team invitation associations
Team.hasMany(TeamInvitation, { foreignKey: 'team_id', as: 'invitations' });
TeamInvitation.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

User.hasMany(TeamInvitation, { foreignKey: 'inviter_id', as: 'sentInvitations' });
TeamInvitation.belongsTo(User, { foreignKey: 'inviter_id', as: 'inviter' });

User.hasMany(TeamInvitation, { foreignKey: 'invitee_id', as: 'receivedInvitations' });
TeamInvitation.belongsTo(User, { foreignKey: 'invitee_id', as: 'invitee' });

export {
  User,
  Connection,
  Query,
  Schedule,
  ExecutionHistory,
  ScheduleDependency,
  QueryTemplate,
  Team,
  TeamMember,
  TeamConnection,
  TeamQuery,
  TeamInvitation
};
