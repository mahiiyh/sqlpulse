import { Sequelize, QueryTypes } from 'sequelize';
import { logger } from '../utils/logger';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://sqlquery_user:sqlquery_pass@localhost:5432/sqlquery_db';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

export enum DependencyType {
  WAIT_FOR_SUCCESS = 'wait_for_success',
  WAIT_FOR_COMPLETION = 'wait_for_completion',
  CONDITIONAL = 'conditional'
}

interface Dependency {
  id: number;
  schedule_id: number;
  depends_on_schedule_id: number;
  dependency_type: DependencyType;
  condition_config: any;
}

interface LastExecution {
  id: number;
  status: string;
  rows_affected: number;
  execution_time_ms: number;
  completed_at: Date;
}

export class DependencyChecker {
  /**
   * Check if a schedule can be executed based on its dependencies
   */
  static async canExecute(scheduleId: number): Promise<{ canExecute: boolean; reason?: string }> {
    try {
      // Get all active dependencies for this schedule
      const dependencies = await sequelize.query<Dependency>(`
        SELECT id, schedule_id, depends_on_schedule_id, dependency_type, condition_config
        FROM schedule_dependencies
        WHERE schedule_id = :scheduleId
        AND is_active = true
      `, {
        replacements: { scheduleId },
        type: QueryTypes.SELECT
      });

      if (!dependencies || dependencies.length === 0) {
        return { canExecute: true };
      }

      // Check each dependency
      for (const dependency of dependencies) {
        const result = await this.checkDependency(dependency);
        if (!result.satisfied) {
          return {
            canExecute: false,
            reason: result.reason || `Dependency on schedule ${dependency.depends_on_schedule_id} not satisfied`
          };
        }
      }

      return { canExecute: true };
    } catch (error: any) {
      logger.error('Error checking dependencies:', error);
      return {
        canExecute: false,
        reason: `Error checking dependencies: ${error.message}`
      };
    }
  }

  /**
   * Check if a specific dependency is satisfied
   */
  private static async checkDependency(dependency: Dependency): Promise<{ satisfied: boolean; reason?: string }> {
    // Get the last execution of the dependent schedule
    const lastExecution = await this.getLastExecution(dependency.depends_on_schedule_id);

    if (!lastExecution) {
      return {
        satisfied: false,
        reason: `Schedule ${dependency.depends_on_schedule_id} has never been executed`
      };
    }

    switch (dependency.dependency_type) {
      case DependencyType.WAIT_FOR_SUCCESS:
        return this.checkWaitForSuccess(lastExecution);

      case DependencyType.WAIT_FOR_COMPLETION:
        return this.checkWaitForCompletion(lastExecution);

      case DependencyType.CONDITIONAL:
        return this.checkConditional(lastExecution, dependency.condition_config);

      default:
        return {
          satisfied: false,
          reason: `Unknown dependency type: ${dependency.dependency_type}`
        };
    }
  }

  /**
   * Get the last execution of a schedule
   */
  private static async getLastExecution(scheduleId: number): Promise<LastExecution | null> {
    const results = await sequelize.query<LastExecution>(`
      SELECT id, status, rows_affected, execution_time_ms, completed_at
      FROM execution_history
      WHERE schedule_id = :scheduleId
      AND completed_at IS NOT NULL
      ORDER BY completed_at DESC
      LIMIT 1
    `, {
      replacements: { scheduleId },
      type: QueryTypes.SELECT
    });

    return results && results.length > 0 ? results[0] : null;
  }

  /**
   * Check wait_for_success dependency - parent must have succeeded
   */
  private static checkWaitForSuccess(lastExecution: LastExecution): { satisfied: boolean; reason?: string } {
    if (lastExecution.status === 'success') {
      return { satisfied: true };
    }

    return {
      satisfied: false,
      reason: `Last execution status was '${lastExecution.status}', expected 'success'`
    };
  }

  /**
   * Check wait_for_completion dependency - parent must have completed (success or failed)
   */
  private static checkWaitForCompletion(lastExecution: LastExecution): { satisfied: boolean; reason?: string } {
    if (lastExecution.status === 'success' || lastExecution.status === 'failed') {
      return { satisfied: true };
    }

    return {
      satisfied: false,
      reason: `Last execution status was '${lastExecution.status}', expected 'success' or 'failed'`
    };
  }

  /**
   * Check conditional dependency - custom conditions based on config
   */
  private static checkConditional(lastExecution: LastExecution, config: any): { satisfied: boolean; reason?: string } {
    if (!config) {
      return { satisfied: true };
    }

    // Check required status
    if (config.required_status && lastExecution.status !== config.required_status) {
      return {
        satisfied: false,
        reason: `Status was '${lastExecution.status}', expected '${config.required_status}'`
      };
    }

    // Check minimum rows
    if (config.min_rows !== undefined && (lastExecution.rows_affected || 0) < config.min_rows) {
      return {
        satisfied: false,
        reason: `Rows affected was ${lastExecution.rows_affected || 0}, expected at least ${config.min_rows}`
      };
    }

    // Check maximum rows
    if (config.max_rows !== undefined && (lastExecution.rows_affected || 0) > config.max_rows) {
      return {
        satisfied: false,
        reason: `Rows affected was ${lastExecution.rows_affected || 0}, expected at most ${config.max_rows}`
      };
    }

    // Check maximum duration
    if (config.max_duration_ms !== undefined && (lastExecution.execution_time_ms || 0) > config.max_duration_ms) {
      return {
        satisfied: false,
        reason: `Execution time was ${lastExecution.execution_time_ms}ms, expected at most ${config.max_duration_ms}ms`
      };
    }

    return { satisfied: true };
  }

  /**
   * Detect circular dependencies for a schedule
   */
  static async hasCircularDependency(scheduleId: number, dependsOnScheduleId: number): Promise<boolean> {
    try {
      const visited = new Set<number>();
      return await this.checkCircular(dependsOnScheduleId, scheduleId, visited);
    } catch (error) {
      logger.error('Error checking circular dependency:', error);
      return false;
    }
  }

  /**
   * Recursive helper to detect circular dependencies
   */
  private static async checkCircular(currentId: number, targetId: number, visited: Set<number>): Promise<boolean> {
    if (currentId === targetId) {
      return true;
    }

    if (visited.has(currentId)) {
      return false;
    }

    visited.add(currentId);

    const dependencies = await sequelize.query<{ depends_on_schedule_id: number }>(`
      SELECT depends_on_schedule_id
      FROM schedule_dependencies
      WHERE schedule_id = :currentId
      AND is_active = true
    `, {
      replacements: { currentId },
      type: QueryTypes.SELECT
    });

    for (const dep of dependencies || []) {
      if (await this.checkCircular(dep.depends_on_schedule_id, targetId, visited)) {
        return true;
      }
    }

    return false;
  }
}
