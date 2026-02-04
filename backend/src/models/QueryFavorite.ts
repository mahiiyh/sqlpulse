/**
 * Query Favorites Feature
 * Allows users to mark queries as favorites for quick access
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

interface QueryFavoriteAttributes {
  id: number;
  user_id: number;
  query_id: number;
  created_at?: Date;
}

interface QueryFavoriteCreationAttributes extends Optional<QueryFavoriteAttributes, 'id' | 'created_at'> {}

export class QueryFavorite extends Model<QueryFavoriteAttributes, QueryFavoriteCreationAttributes> implements QueryFavoriteAttributes {
  public id!: number;
  public user_id!: number;
  public query_id!: number;
  public readonly created_at!: Date;
}

QueryFavorite.init(
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'query_favorites',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'query_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['query_id']
      }
    ]
  }
);

export default QueryFavorite;
