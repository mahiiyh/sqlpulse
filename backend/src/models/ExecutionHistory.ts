import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ExecutionType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled'
}

interface ExecutionHistoryAttributes {
  id: number;
  query_id: number;
  schedule_id?: number;
  connection_id: number;
  executed_by?: number;
  execution_type: ExecutionType;
  executed_at: Date;
  completed_at?: Date;
  execution_time_ms?: number;
  rows_affected?: number;
  status: ExecutionStatus;
  error_message?: string;
  parameters_used?: object;
  retry_attempt?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ExecutionHistoryCreationAttributes extends Optional<ExecutionHistoryAttributes, 'id' | 'created_at' | 'updated_at' | 'schedule_id' | 'executed_by' | 'completed_at' | 'execution_time_ms' | 'rows_affected' | 'error_message' | 'parameters_used' | 'retry_attempt'> {}

export class ExecutionHistory extends Model<ExecutionHistoryAttributes, ExecutionHistoryCreationAttributes> implements ExecutionHistoryAttributes {
  public id!: number;
  public query_id!: number;
  public schedule_id?: number;
  public connection_id!: number;
  public executed_by?: number;
  public execution_type!: ExecutionType;
  public executed_at!: Date;
  public completed_at?: Date;
  public execution_time_ms?: number;
  public rows_affected?: number;
  public status!: ExecutionStatus;
  public error_message?: string;
  public parameters_used?: object;
  public retry_attempt?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ExecutionHistory.init(
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
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'schedules',
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
    executed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    execution_type: {
      type: DataTypes.ENUM(...Object.values(ExecutionType)),
      allowNull: false,
      defaultValue: ExecutionType.MANUAL
    },
    executed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    execution_time_ms: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rows_affected: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ExecutionStatus)),
      allowNull: false,
      defaultValue: ExecutionStatus.PENDING
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parameters_used: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    retry_attempt: {
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
    tableName: 'execution_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['query_id']
      },
      {
        fields: ['schedule_id']
      },
      {
        fields: ['executed_at']
      },
      {
        fields: ['status']
      }
    ]
  }
);

export default ExecutionHistory;
