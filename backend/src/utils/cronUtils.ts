import cron from 'node-cron';

/**
 * Calculate the next run time for a cron expression
 * @param cronExpression - Valid cron expression (e.g., '0 0 * * *')
 * @param fromDate - Starting date (default: now)
 * @returns Next run date or null if invalid
 */
export function calculateNextRun(cronExpression: string, fromDate: Date = new Date()): Date | null {
  try {
    // Validate the cron expression
    if (!cron.validate(cronExpression)) {
      return null;
    }

    // Parse cron expression
    const parts = cronExpression.trim().split(/\s+/);
    if (parts.length < 5) {
      return null;
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Start from the next minute
    const nextRun = new Date(fromDate);
    nextRun.setSeconds(0);
    nextRun.setMilliseconds(0);
    nextRun.setMinutes(nextRun.getMinutes() + 1);

    // Find the next valid run time (max 1 year ahead)
    const maxIterations = 525600; // Minutes in a year
    let iterations = 0;

    while (iterations < maxIterations) {
      if (matchesCron(nextRun, minute, hour, dayOfMonth, month, dayOfWeek)) {
        return nextRun;
      }
      nextRun.setMinutes(nextRun.getMinutes() + 1);
      iterations++;
    }

    return null;
  } catch (error) {
    console.error('Error calculating next run:', error);
    return null;
  }
}

/**
 * Check if a date matches a cron expression
 */
function matchesCron(
  date: Date,
  minute: string,
  hour: string,
  dayOfMonth: string,
  month: string,
  dayOfWeek: string
): boolean {
  return (
    matchesCronPart(date.getMinutes(), minute, 0, 59) &&
    matchesCronPart(date.getHours(), hour, 0, 23) &&
    matchesCronPart(date.getDate(), dayOfMonth, 1, 31) &&
    matchesCronPart(date.getMonth() + 1, month, 1, 12) &&
    matchesCronPart(date.getDay(), dayOfWeek, 0, 6)
  );
}

/**
 * Check if a value matches a cron part (*, number, range, step, list)
 */
function matchesCronPart(value: number, pattern: string, min: number, _max: number): boolean {
  // Wildcard
  if (pattern === '*') {
    return true;
  }

  // Step values (e.g., */5)
  if (pattern.includes('/')) {
    const [range, step] = pattern.split('/');
    const stepNum = parseInt(step, 10);
    if (range === '*') {
      return value % stepNum === min % stepNum;
    }
  }

  // Range (e.g., 1-5)
  if (pattern.includes('-')) {
    const [start, end] = pattern.split('-').map(Number);
    return value >= start && value <= end;
  }

  // List (e.g., 1,3,5)
  if (pattern.includes(',')) {
    const values = pattern.split(',').map(Number);
    return values.includes(value);
  }

  // Exact match
  const num = parseInt(pattern, 10);
  return value === num;
}

/**
 * Validate a cron expression
 */
export function validateCronExpression(cronExpression: string): boolean {
  return cron.validate(cronExpression);
}

/**
 * Get human-readable description of cron expression
 */
export function describeCronExpression(cronExpression: string): string {
  try {
    const parts = cronExpression.trim().split(/\s+/);
    if (parts.length < 5) {
      return 'Invalid cron expression';
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Common patterns
    if (cronExpression === '0 0 * * *') return 'Daily at midnight';
    if (cronExpression === '0 12 * * *') return 'Daily at noon';
    if (cronExpression === '*/5 * * * *') return 'Every 5 minutes';
    if (cronExpression === '0 * * * *') return 'Every hour';
    if (cronExpression === '0 0 * * 0') return 'Weekly on Sunday at midnight';
    if (cronExpression === '0 0 1 * *') return 'Monthly on the 1st at midnight';

    // Build description
    let description = '';

    // Minute
    if (minute === '*') {
      description += 'Every minute';
    } else if (minute.includes('/')) {
      description += `Every ${minute.split('/')[1]} minutes`;
    } else {
      description += `At minute ${minute}`;
    }

    // Hour
    if (hour !== '*') {
      if (hour.includes('/')) {
        description += ` of every ${hour.split('/')[1]} hours`;
      } else {
        description += ` past hour ${hour}`;
      }
    }

    // Day of month
    if (dayOfMonth !== '*') {
      description += ` on day ${dayOfMonth} of the month`;
    }

    // Month
    if (month !== '*') {
      const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      description += ` in ${monthNames[parseInt(month, 10)] || month}`;
    }

    // Day of week
    if (dayOfWeek !== '*') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      description += ` on ${dayNames[parseInt(dayOfWeek, 10)] || dayOfWeek}`;
    }

    return description;
  } catch (error) {
    return 'Unable to describe cron expression';
  }
}
