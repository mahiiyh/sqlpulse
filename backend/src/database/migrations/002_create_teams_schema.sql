-- Migration: Create Teams Schema
-- Description: Creates all team-related tables (teams, team_members, team_connections, team_queries, team_invitations)
-- Date: 2026-02-04

BEGIN;

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

-- Create team_connections table
CREATE TABLE IF NOT EXISTS team_connections (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON UPDATE CASCADE ON DELETE CASCADE,
  connection_id INTEGER NOT NULL REFERENCES connections(id) ON UPDATE CASCADE ON DELETE CASCADE,
  shared_by INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  shared_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, connection_id)
);

-- Create team_queries table
CREATE TABLE IF NOT EXISTS team_queries (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON UPDATE CASCADE ON DELETE CASCADE,
  query_id INTEGER NOT NULL REFERENCES queries(id) ON UPDATE CASCADE ON DELETE CASCADE,
  shared_by INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  shared_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, query_id)
);

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON UPDATE CASCADE ON DELETE CASCADE,
  inviter_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  invitee_email VARCHAR(255) NOT NULL,
  invitee_id INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  UNIQUE(team_id, invitee_email)
);

-- Create indexes for teams
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);

-- Create indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Create indexes for team_connections
CREATE INDEX IF NOT EXISTS idx_team_connections_team_id ON team_connections(team_id);
CREATE INDEX IF NOT EXISTS idx_team_connections_connection_id ON team_connections(connection_id);

-- Create indexes for team_queries
CREATE INDEX IF NOT EXISTS idx_team_queries_team_id ON team_queries(team_id);
CREATE INDEX IF NOT EXISTS idx_team_queries_query_id ON team_queries(query_id);

-- Create indexes for team_invitations
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee_email ON team_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

-- Add comments
COMMENT ON TABLE teams IS 'Team organizations for collaborative query management';
COMMENT ON TABLE team_members IS 'Members belonging to teams with their roles';
COMMENT ON TABLE team_connections IS 'Database connections shared with teams';
COMMENT ON TABLE team_queries IS 'Saved queries shared with teams';
COMMENT ON TABLE team_invitations IS 'Pending and processed team invitations';

COMMIT;

-- Verification query
SELECT 
  'teams' as table_name, count(*) as row_count FROM teams
UNION ALL
SELECT 'team_members', count(*) FROM team_members
UNION ALL
SELECT 'team_connections', count(*) FROM team_connections
UNION ALL
SELECT 'team_queries', count(*) FROM team_queries
UNION ALL
SELECT 'team_invitations', count(*) FROM team_invitations;
