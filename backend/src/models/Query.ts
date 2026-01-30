import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

export enum QueryCategory {
  CUSTOMER_INQUIRIES = 'customer_inquiries',
  DATA_CHANGES = 'data_changes',
  REPORTS = 'reports',
  MAINTENANCE = 'maintenance',
  UPDATES = 'updates',
  SELECTS = 'selects',
  DELETES = 'deletes',
  ANALYTICS = 'analytics',
  OTHER = 'other'
}

interface QueryAttributes {
  id: number;
  name: string;
  description?: string;
  sql_content: string;
  category: QueryCategory;
  database_type: string;
  project_name?: string;
  created_by: number;
  is_public: boolean;
  is_dangerous: boolean;
  is_schedulable: boolean;
  is_favorite?: boolean;
  execution_count: number;
  created_at?: Date;
  updated_at?: Date;
}

interface QueryCreationAttributes extends Optional<QueryAttributes, 'id' | 'created_at' | 'updated_at' | 'is_public' | 'is_dangerous' | 'is_schedulable' | 'is_favorite' | 'execution_count' | 'description' | 'project_name'> {}

export class Query extends Model<QueryAttributes, QueryCreationAttributes> implements QueryAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public sql_content!: string;
  public category!: QueryCategory;
  public database_type!: string;
  public project_name?: string;
  public created_by!: number;
  public is_public!: boolean;
  public is_dangerous!: boolean;
  public is_schedulable!: boolean;
  public is_favorite?: boolean;
  public execution_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Query.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sql_content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(...Object.values(QueryCategory)),
      allowNull: false,
      defaultValue: QueryCategory.OTHER
    },
    database_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    project_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_dangerous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_schedulable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_favorite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    execution_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'queries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Query;
