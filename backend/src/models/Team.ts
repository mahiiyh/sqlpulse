import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database/connection';

interface TeamAttributes {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

interface TeamCreationAttributes extends Optional<TeamAttributes, 'id' | 'description' | 'created_at' | 'updated_at'> {}

export class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public created_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Team.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'teams',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Team;
