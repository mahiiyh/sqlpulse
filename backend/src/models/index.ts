import User from './User';
import Connection from './Connection';
import Query from './Query';
import Schedule from './Schedule';
import ExecutionHistory from './ExecutionHistory';
import ScheduleDependency from './ScheduleDependency';
import QueryTemplate from './QueryTemplate';

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

export {
  User,
  Connection,
  Query,
  Schedule,
  ExecutionHistory,
  ScheduleDependency,
  QueryTemplate
};
