import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

interface QueryTemplateAttributes {
  id: number;
  name: string;
  description: string | null;
  sql_template: string;
  category: string;
  tags: string[];
  variables: Record<string, any> | null;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

interface QueryTemplateCreationAttributes extends Optional<QueryTemplateAttributes, 'id' | 'description' | 'tags' | 'variables' | 'created_at' | 'updated_at'> {}

class QueryTemplate extends Model<QueryTemplateAttributes, QueryTemplateCreationAttributes> implements QueryTemplateAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public sql_template!: string;
  public category!: string;
  public tags!: string[];
  public variables!: Record<string, any> | null;
  public created_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

QueryTemplate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sql_template: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'General',
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    variables: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Template variables like {{table_name}}, {{date_from}}',
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
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'query_templates',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['category'],
      },
      {
        fields: ['created_by'],
      },
    ],
  }
);

export default QueryTemplate;
