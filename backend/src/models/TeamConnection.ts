import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database/connection';

interface TeamConnectionAttributes {
  id: number;
  team_id: number;
  connection_id: number;
  shared_by: number;
  shared_at: Date;
}

interface TeamConnectionCreationAttributes extends Optional<TeamConnectionAttributes, 'id' | 'shared_at'> {}

export class TeamConnection extends Model<TeamConnectionAttributes, TeamConnectionCreationAttributes> implements TeamConnectionAttributes {
  public id!: number;
  public team_id!: number;
  public connection_id!: number;
  public shared_by!: number;
  public readonly shared_at!: Date;
}

TeamConnection.init(
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
    connection_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shared_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shared_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'team_connections',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['team_id', 'connection_id']
      }
    ]
  }
);

export default TeamConnection;
