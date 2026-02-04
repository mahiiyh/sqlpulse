import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database/connection';

export type TeamRole = 'owner' | 'admin' | 'member';

interface TeamMemberAttributes {
  id: number;
  team_id: number;
  user_id: number;
  role: TeamRole;
  joined_at: Date;
}

interface TeamMemberCreationAttributes extends Optional<TeamMemberAttributes, 'id' | 'joined_at'> {}

export class TeamMember extends Model<TeamMemberAttributes, TeamMemberCreationAttributes> implements TeamMemberAttributes {
  public id!: number;
  public team_id!: number;
  public user_id!: number;
  public role!: TeamRole;
  public readonly joined_at!: Date;
}

TeamMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'member'
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'team_members',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['team_id', 'user_id']
      }
    ]
  }
);

export default TeamMember;
