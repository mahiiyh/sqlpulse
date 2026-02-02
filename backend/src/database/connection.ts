import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://sqlquery_user:sqlquery_pass@localhost:5432/sqlquery_db';

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    // Force IPv4 connection
    host: process.env.DATABASE_URL ? undefined : 'localhost',
    family: 4
  },
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

export default sequelize;
