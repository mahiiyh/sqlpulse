import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { calculateNextRun } from '../utils/cronUtils';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sql_query_dashboard',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false,
  }
);

async function updateNextRunTime() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Get all schedules with cron expressions but no next_run_time
    const [schedules] = await sequelize.query(`
      SELECT id, cron_expression 
      FROM schedules 
      WHERE cron_expression IS NOT NULL
      AND (next_run_time IS NULL OR next_run_time < NOW())
    `, { type: 'SELECT' }) as any[];

    console.log(`\nFound ${schedules?.length || 0} schedules to update`);

    if (schedules && schedules.length > 0) {
      for (const schedule of schedules) {
        const nextRun = calculateNextRun(schedule.cron_expression);
        
        if (nextRun) {
          await sequelize.query(
            `UPDATE schedules SET next_run_time = :nextRun WHERE id = :id`,
            {
              replacements: { nextRun, id: schedule.id }
            }
          );
          console.log(`✓ Schedule ${schedule.id}: ${schedule.cron_expression} -> ${nextRun.toLocaleString()}`);
        } else {
          console.log(`✗ Schedule ${schedule.id}: Invalid cron expression: ${schedule.cron_expression}`);
        }
      }
    }

    console.log('\n✓ Next run times updated successfully');
    
  } catch (error) {
    console.error('Error updating next run times:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the update
updateNextRunTime();
