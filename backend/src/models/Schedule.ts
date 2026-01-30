import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

export enum ScheduleType {
  ONE_TIME = 'one_time',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  HOURLY = 'hourly',
  CRON = 'cron'
}

interface ScheduleAttributes {
  id: number;
  query_id: number;
  connection_id: number;
  schedule_name: string;
  description?: string;
  schedule_type: ScheduleType;
  cron_expression?: string;
  next_run_time?: Date;
  last_run_time?: Date;
  is_enabled: boolean;
  timezone: string;
  created_by: number;
  
  // Notification configuration
  notification_enabled?: boolean;
  notification_channel?: string;
  notification_config?: any; // JSON field for channel-specific config
  
  // Retry configuration
  max_retries?: number;
  retry_delay_seconds?: number;
  exponential_backoff?: boolean;
  
  created_at?: Date;
  updated_at?: Date;
}

interface ScheduleCreationAttributes extends Optional<ScheduleAttributes, 'id' | 'created_at' | 'updated_at' | 'is_enabled' | 'description' | 'cron_expression' | 'next_run_time' | 'last_run_time' | 'notification_enabled' | 'notification_channel' | 'notification_config' | 'max_retries' | 'retry_delay_seconds' | 'exponential_backoff'> {}

export class Schedule extends Model<ScheduleAttributes, ScheduleCreationAttributes> implements ScheduleAttributes {
  public id!: number;
  public query_id!: number;
  public connection_id!: number;
  public schedule_name!: string;
  public description?: string;
  public schedule_type!: ScheduleType;
  public cron_expression?: string;
  public next_run_time?: Date;
  public last_run_time?: Date;
  public is_enabled!: boolean;
  public timezone!: string;
  public created_by!: number;
  
  // Notification configuration
  public notification_enabled?: boolean;
  public notification_channel?: string;
  public notification_config?: any;
  
  // Retry configuration
  public max_retries?: number;
  public retry_delay_seconds?: number;
  public exponential_backoff?: boolean;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Schedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    query_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'queries',
        key: 'id'
      }
    },
    connection_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'connections',
        key: 'id'
      }
    },
    schedule_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    schedule_type: {
      type: DataTypes.ENUM(...Object.values(ScheduleType)),
      allowNull: false
    },
    cron_expression: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    next_run_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_run_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'UTC'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notification_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    notification_channel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    notification_config: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    max_retries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    retry_delay_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60
    },
    exponential_backoff: {
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
    tableName: 'schedules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Schedule;
