import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';

export interface ParameterContext {
  userId?: number;
  username?: string;
  userEmail?: string;
  timezone?: string;
}

export class QueryParameterProcessor {
  /**
   * Replace all query parameters with their actual values
   */
  static processParameters(sqlQuery: string, context: ParameterContext = {}): string {
    const now = new Date();

    // Date parameters
    const replacements: Record<string, string> = {
      '@TODAY': format(now, 'yyyy-MM-dd'),
      '@YESTERDAY': format(subDays(now, 1), 'yyyy-MM-dd'),
      '@TOMORROW': format(subDays(now, -1), 'yyyy-MM-dd'),
      
      // Month boundaries
      '@FIRST_DAY_OF_MONTH': format(startOfMonth(now), 'yyyy-MM-dd'),
      '@LAST_DAY_OF_MONTH': format(endOfMonth(now), 'yyyy-MM-dd'),
      '@FIRST_DAY_OF_LAST_MONTH': format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'),
      '@LAST_DAY_OF_LAST_MONTH': format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'),
      
      // Year boundaries
      '@FIRST_DAY_OF_YEAR': format(startOfYear(now), 'yyyy-MM-dd'),
      '@CURRENT_YEAR': format(now, 'yyyy'),
      '@CURRENT_MONTH': format(now, 'MM'),
      '@CURRENT_DAY': format(now, 'dd'),
      
      // Timestamp parameters
      '@NOW': format(now, 'yyyy-MM-dd HH:mm:ss'),
      '@NOW_UTC': now.toISOString(),
      '@UNIX_TIMESTAMP': Math.floor(now.getTime() / 1000).toString(),
      
      // Week parameters
      '@7_DAYS_AGO': format(subDays(now, 7), 'yyyy-MM-dd'),
      '@30_DAYS_AGO': format(subDays(now, 30), 'yyyy-MM-dd'),
      '@90_DAYS_AGO': format(subDays(now, 90), 'yyyy-MM-dd'),
      '@365_DAYS_AGO': format(subDays(now, 365), 'yyyy-MM-dd'),
      
      // User context parameters
      '@CURRENT_USER_ID': context.userId?.toString() || 'NULL',
      '@CURRENT_USER': context.username || 'system',
      '@CURRENT_USER_EMAIL': context.userEmail || '',
    };

    // Replace all parameters
    let processedQuery = sqlQuery;
    for (const [param, value] of Object.entries(replacements)) {
      // Use regex to replace whole word only (not part of other text)
      const regex = new RegExp(`\\${param}\\b`, 'g');
      processedQuery = processedQuery.replace(regex, value);
    }

    return processedQuery;
  }

  /**
   * Extract all parameters used in a query
   */
  static extractParameters(sqlQuery: string): string[] {
    const paramRegex = /@[A-Z_0-9]+/g;
    const matches = sqlQuery.match(paramRegex);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Validate if all parameters in query are supported
   */
  static validateParameters(sqlQuery: string): { valid: boolean; unsupportedParams: string[] } {
    const supportedParams = [
      '@TODAY', '@YESTERDAY', '@TOMORROW',
      '@FIRST_DAY_OF_MONTH', '@LAST_DAY_OF_MONTH',
      '@FIRST_DAY_OF_LAST_MONTH', '@LAST_DAY_OF_LAST_MONTH',
      '@FIRST_DAY_OF_YEAR', '@CURRENT_YEAR', '@CURRENT_MONTH', '@CURRENT_DAY',
      '@NOW', '@NOW_UTC', '@UNIX_TIMESTAMP',
      '@7_DAYS_AGO', '@30_DAYS_AGO', '@90_DAYS_AGO', '@365_DAYS_AGO',
      '@CURRENT_USER_ID', '@CURRENT_USER', '@CURRENT_USER_EMAIL'
    ];

    const usedParams = this.extractParameters(sqlQuery);
    const unsupportedParams = usedParams.filter(param => !supportedParams.includes(param));

    return {
      valid: unsupportedParams.length === 0,
      unsupportedParams
    };
  }

  /**
   * Get parameter values for preview/testing
   */
  static getParameterValues(context: ParameterContext = {}): Record<string, string> {
    const now = new Date();

    return {
      '@TODAY': format(now, 'yyyy-MM-dd'),
      '@YESTERDAY': format(subDays(now, 1), 'yyyy-MM-dd'),
      '@TOMORROW': format(subDays(now, -1), 'yyyy-MM-dd'),
      '@FIRST_DAY_OF_MONTH': format(startOfMonth(now), 'yyyy-MM-dd'),
      '@LAST_DAY_OF_MONTH': format(endOfMonth(now), 'yyyy-MM-dd'),
      '@FIRST_DAY_OF_LAST_MONTH': format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'),
      '@LAST_DAY_OF_LAST_MONTH': format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'),
      '@FIRST_DAY_OF_YEAR': format(startOfYear(now), 'yyyy-MM-dd'),
      '@CURRENT_YEAR': format(now, 'yyyy'),
      '@CURRENT_MONTH': format(now, 'MM'),
      '@CURRENT_DAY': format(now, 'dd'),
      '@NOW': format(now, 'yyyy-MM-dd HH:mm:ss'),
      '@NOW_UTC': now.toISOString(),
      '@UNIX_TIMESTAMP': Math.floor(now.getTime() / 1000).toString(),
      '@7_DAYS_AGO': format(subDays(now, 7), 'yyyy-MM-dd'),
      '@30_DAYS_AGO': format(subDays(now, 30), 'yyyy-MM-dd'),
      '@90_DAYS_AGO': format(subDays(now, 90), 'yyyy-MM-dd'),
      '@365_DAYS_AGO': format(subDays(now, 365), 'yyyy-MM-dd'),
      '@CURRENT_USER_ID': context.userId?.toString() || 'NULL',
      '@CURRENT_USER': context.username || 'system',
      '@CURRENT_USER_EMAIL': context.userEmail || '',
    };
  }
}
