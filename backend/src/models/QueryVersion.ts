import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

interface QueryVersionAttributes {
  id: number;
  query_id: number;
  version_number: number;
  sql_content: string;
  change_description?: string;
  created_by: number;
  created_at: Date;
}

interface QueryVersionCreationAttributes extends Optional<QueryVersionAttributes, 'id' | 'created_at' | 'change_description'> {}

export class QueryVersion extends Model<QueryVersionAttributes, QueryVersionCreationAttributes> implements QueryVersionAttributes {
  public id!: number;
  public query_id!: number;
  public version_number!: number;
  public sql_content!: string;
  public change_description?: string;
  public created_by!: number;
  public readonly created_at!: Date;
}

QueryVersion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    query_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'queries',
        key: 'id',
      },
    },
    version_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sql_content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    change_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'query_versions',
    timestamps: false,
    indexes: [
      {
        fields: ['query_id', 'version_number'],
        unique: true,
      },
      {
        fields: ['query_id'],
      },
    ],
  }
);
