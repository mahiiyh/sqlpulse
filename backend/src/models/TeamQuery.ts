import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database/connection';

interface TeamQueryAttributes {
  id: number;
  team_id: number;
  query_id: number;
  shared_by: number;
  shared_at: Date;
}

interface TeamQueryCreationAttributes extends Optional<TeamQueryAttributes, 'id' | 'shared_at'> {}

export class TeamQuery extends Model<TeamQueryAttributes, TeamQueryCreationAttributes> implements TeamQueryAttributes {
  public id!: number;
  public team_id!: number;
  public query_id!: number;
  public shared_by!: number;
  public readonly shared_at!: Date;
}

TeamQuery.init(
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
    query_id: {
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
    tableName: 'team_queries',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['team_id', 'query_id']
      }
    ]
  }
);

export default TeamQuery;
