import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/connection';

export enum DependencyType {
  WAIT_FOR_SUCCESS = 'wait_for_success',
  WAIT_FOR_COMPLETION = 'wait_for_completion',
  CONDITIONAL = 'conditional'
}

interface ScheduleDependencyAttributes {
  id: number;
  schedule_id: number;
  depends_on_schedule_id: number;
  dependency_type: DependencyType;
  condition_config?: any;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ScheduleDependencyCreationAttributes extends Optional<ScheduleDependencyAttributes, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'condition_config'> {}

export class ScheduleDependency extends Model<ScheduleDependencyAttributes, ScheduleDependencyCreationAttributes> implements ScheduleDependencyAttributes {
  public id!: number;
  public schedule_id!: number;
  public depends_on_schedule_id!: number;
  public dependency_type!: DependencyType;
  public condition_config?: any;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ScheduleDependency.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'schedules',
        key: 'id'
      }
    },
    depends_on_schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'schedules',
        key: 'id'
      }
    },
    dependency_type: {
      type: DataTypes.ENUM(...Object.values(DependencyType)),
      allowNull: false,
      defaultValue: DependencyType.WAIT_FOR_SUCCESS
    },
    condition_config: {
      type: DataTypes.JSONB,
      allowNull: true
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
    tableName: 'schedule_dependencies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default ScheduleDependency;
