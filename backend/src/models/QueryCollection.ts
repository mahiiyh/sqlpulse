/**
 * Query Collections (Folders)
 * Organize queries into collections for better management
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

interface QueryCollectionAttributes {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_by: number;
  is_shared: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface QueryCollectionCreationAttributes extends Optional<QueryCollectionAttributes, 'id' | 'description' | 'color' | 'icon' | 'is_shared' | 'created_at' | 'updated_at'> {}

export class QueryCollection extends Model<QueryCollectionAttributes, QueryCollectionCreationAttributes> implements QueryCollectionAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public color?: string;
  public icon?: string;
  public created_by!: number;
  public is_shared!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

QueryCollection.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '#3B82F6'
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'folder'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    is_shared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    tableName: 'query_collections',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['created_by']
      }
    ]
  }
);

// Junction table for queries in collections
interface QueryCollectionItemAttributes {
  id: number;
  collection_id: number;
  query_id: number;
  sort_order: number;
  added_at?: Date;
}

interface QueryCollectionItemCreationAttributes extends Optional<QueryCollectionItemAttributes, 'id' | 'sort_order' | 'added_at'> {}

export class QueryCollectionItem extends Model<QueryCollectionItemAttributes, QueryCollectionItemCreationAttributes> implements QueryCollectionItemAttributes {
  public id!: number;
  public collection_id!: number;
  public query_id!: number;
  public sort_order!: number;
  public readonly added_at!: Date;
}

QueryCollectionItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    collection_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'query_collections',
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
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'query_collection_items',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['collection_id', 'query_id']
      },
      {
        fields: ['query_id']
      }
    ]
  }
);

export default QueryCollection;
