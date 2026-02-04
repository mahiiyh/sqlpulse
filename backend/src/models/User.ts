import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  ANALYST = 'analyst',
  SCHEDULER = 'scheduler',
  READ_ONLY = 'read_only'
}

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  timezone: string;
  is_active: boolean;
  failed_login_attempts?: number;
  locked_until?: Date | null;
  last_login_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'timezone'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public role!: UserRole;
  public timezone!: string;
  public is_active!: boolean;
  public failed_login_attempts?: number;
  public locked_until?: Date | null;
  public last_login_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.READ_ONLY
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'UTC'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default User;
