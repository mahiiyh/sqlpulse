/**
 * Recent Query Executions
 * Tracks recently executed queries for quick re-execution
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

interface RecentQueryAttributes {
  id: number;
  user_id: number;
  query_id: number;
  connection_id: number;
  last_executed_at: Date;
  execution_count: number;
}

interface RecentQueryCreationAttributes extends Optional<RecentQueryAttributes, 'id' | 'execution_count'> {}

export class RecentQuery extends Model<RecentQueryAttributes, RecentQueryCreationAttributes> implements RecentQueryAttributes {
  public id!: number;
  public user_id!: number;
  public query_id!: number;
  public connection_id!: number;
  public last_executed_at!: Date;
  public execution_count!: number;
}

RecentQuery.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    query_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'queries',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    connection_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'connections',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    last_executed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    execution_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    sequelize,
    tableName: 'recent_queries',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'query_id', 'connection_id']
      },
      {
        fields: ['user_id', 'last_executed_at']
      }
    ]
  }
);

export default RecentQuery;
