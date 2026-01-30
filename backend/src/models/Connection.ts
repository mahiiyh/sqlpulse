import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

export enum DatabaseType {
  SQLSERVER = 'sqlserver',
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  ORACLE = 'oracle',
  SQLITE = 'sqlite'
}

export enum Environment {
  DEV = 'dev',
  QA = 'qa',
  UAT = 'uat',
  PRODUCTION = 'production'
}

interface ConnectionAttributes {
  id: number;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  database_name: string;
  username: string;
  encrypted_password: string;
  environment: Environment;
  max_connections?: number;
  timeout_seconds?: number;
  connection_string?: string;
  created_by: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ConnectionCreationAttributes extends Optional<ConnectionAttributes, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'max_connections' | 'timeout_seconds' | 'connection_string'> {}

export class Connection extends Model<ConnectionAttributes, ConnectionCreationAttributes> implements ConnectionAttributes {
  public id!: number;
  public name!: string;
  public type!: DatabaseType;
  public host!: string;
  public port!: number;
  public database_name!: string;
  public username!: string;
  public encrypted_password!: string;
  public environment!: Environment;
  public max_connections?: number;
  public timeout_seconds?: number;
  public connection_string?: string;
  public created_by!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Connection.init(
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
    type: {
      type: DataTypes.ENUM(...Object.values(DatabaseType)),
      allowNull: false
    },
    host: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    database_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    encrypted_password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    environment: {
      type: DataTypes.ENUM(...Object.values(Environment)),
      allowNull: false,
      defaultValue: Environment.DEV
    },
    max_connections: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10
    },
    timeout_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30
    },
    connection_string: {
      type: DataTypes.TEXT,
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
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'connections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Connection;
