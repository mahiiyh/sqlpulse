import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database/connection';

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

interface TeamInvitationAttributes {
  id: number;
  team_id: number;
  inviter_id: number;
  invitee_email: string;
  invitee_id: number | null;
  status: InvitationStatus;
  invited_at: Date;
  responded_at: Date | null;
}

interface TeamInvitationCreationAttributes extends Optional<TeamInvitationAttributes, 'id' | 'invitee_id' | 'invited_at' | 'responded_at'> {}

export class TeamInvitation extends Model<TeamInvitationAttributes, TeamInvitationCreationAttributes> implements TeamInvitationAttributes {
  public id!: number;
  public team_id!: number;
  public inviter_id!: number;
  public invitee_email!: string;
  public invitee_id!: number | null;
  public status!: InvitationStatus;
  public readonly invited_at!: Date;
  public responded_at!: Date | null;
}

TeamInvitation.init(
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
    inviter_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    invitee_email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    invitee_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending'
    },
    invited_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'team_invitations',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['team_id', 'invitee_email']
      }
    ]
  }
);

export default TeamInvitation;
