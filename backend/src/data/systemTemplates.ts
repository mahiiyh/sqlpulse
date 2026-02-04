/**
 * System-level Pre-made Query Templates
 * These templates are available to all users and provide common query patterns
 */

export interface SystemTemplate {
  name: string;
  description: string;
  sql_template: string;
  category: string;
  database_type: string;
  tags: string[];
  variables?: Record<string, { description: string; example: string; type: string }>;
}

export const systemTemplates: SystemTemplate[] = [
  // Customer & User Management
  {
    name: 'Find Customer by Email',
    description: 'Search for a customer using their email address',
    category: 'customer_inquiries',
    database_type: 'postgresql',
    tags: ['customer', 'search', 'user'],
    sql_template: `SELECT 
  id,
  email,
  first_name,
  last_name,
  created_at,
  last_login,
  status
FROM customers
WHERE email = '{{email}}';`,
    variables: {
      email: {
        description: 'Customer email address',
        example: 'customer@example.com',
        type: 'string'
      }
    }
  },
  {
    name: 'List Recent Customers',
    description: 'Get customers who registered in the last N days',
    category: 'customer_inquiries',
    database_type: 'postgresql',
    tags: ['customer', 'recent', 'registration'],
    sql_template: `SELECT 
  id,
  email,
  first_name,
  last_name,
  created_at,
  status
FROM customers
WHERE created_at >= CURRENT_DATE - INTERVAL '{{days}} days'
ORDER BY created_at DESC
LIMIT {{limit}};`,
    variables: {
      days: {
        description: 'Number of days to look back',
        example: '7',
        type: 'number'
      },
      limit: {
        description: 'Maximum number of results',
        example: '100',
        type: 'number'
      }
    }
  },
  {
    name: 'Customer Activity Summary',
    description: 'Get comprehensive activity summary for a customer',
    category: 'analytics',
    database_type: 'postgresql',
    tags: ['customer', 'analytics', 'summary'],
    sql_template: `SELECT 
  c.id,
  c.email,
  c.first_name,
  c.last_name,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total_amount) as total_spent,
  MAX(o.created_at) as last_order_date,
  c.created_at as registration_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE c.id = {{customer_id}}
GROUP BY c.id, c.email, c.first_name, c.last_name, c.created_at;`
  },

  // Reports & Analytics
  {
    name: 'Daily Sales Report',
    description: 'Generate daily sales summary for a specific date',
    category: 'reports',
    database_type: 'postgresql',
    tags: ['sales', 'daily', 'revenue'],
    sql_template: `SELECT 
  DATE(created_at) as sale_date,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value,
  COUNT(DISTINCT customer_id) as unique_customers
FROM orders
WHERE DATE(created_at) = '{{date}}'
GROUP BY DATE(created_at);`,
    variables: {
      date: {
        description: 'Report date (YYYY-MM-DD)',
        example: '2026-02-04',
        type: 'date'
      }
    }
  },
  {
    name: 'Monthly Revenue Trend',
    description: 'Monthly revenue breakdown for the current year',
    category: 'analytics',
    database_type: 'postgresql',
    tags: ['revenue', 'monthly', 'trend'],
    sql_template: `SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_orders,
  SUM(total_amount) as revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE EXTRACT(YEAR FROM created_at) = {{year}}
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;`,
    variables: {
      year: {
        description: 'Year for the report',
        example: '2026',
        type: 'number'
      }
    }
  },
  {
    name: 'Top Customers by Revenue',
    description: 'List top N customers by total spending',
    category: 'analytics',
    database_type: 'postgresql',
    tags: ['customers', 'revenue', 'top'],
    sql_template: `SELECT 
  c.id,
  c.email,
  c.first_name,
  c.last_name,
  COUNT(o.id) as order_count,
  SUM(o.total_amount) as total_spent,
  MAX(o.created_at) as last_order_date
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.email, c.first_name, c.last_name
ORDER BY total_spent DESC
LIMIT {{limit}};`,
    variables: {
      limit: {
        description: 'Number of top customers to return',
        example: '10',
        type: 'number'
      }
    }
  },

  // Data Maintenance
  {
    name: 'Find Duplicate Records',
    description: 'Identify duplicate entries in a table by specified column',
    category: 'maintenance',
    database_type: 'postgresql',
    tags: ['duplicate', 'data-quality', 'cleanup'],
    sql_template: `SELECT 
  {{column_name}},
  COUNT(*) as occurrence_count,
  ARRAY_AGG(id) as record_ids
FROM {{table_name}}
GROUP BY {{column_name}}
HAVING COUNT(*) > 1
ORDER BY occurrence_count DESC;`,
    variables: {
      table_name: {
        description: 'Table to check for duplicates',
        example: 'customers',
        type: 'string'
      },
      column_name: {
        description: 'Column to check for duplicate values',
        example: 'email',
        type: 'string'
      }
    }
  },
  {
    name: 'Archive Old Records',
    description: 'Safely move old records to archive table',
    category: 'maintenance',
    database_type: 'postgresql',
    tags: ['archive', 'cleanup', 'maintenance'],
    sql_template: `-- Step 1: Copy to archive table
INSERT INTO {{table_name}}_archive
SELECT * FROM {{table_name}}
WHERE created_at < CURRENT_DATE - INTERVAL '{{days}} days';

-- Step 2: Delete from main table (uncomment after verifying)
-- DELETE FROM {{table_name}}
-- WHERE created_at < CURRENT_DATE - INTERVAL '{{days}} days';

-- Step 3: Verify counts
SELECT 
  'Original' as table_name, 
  COUNT(*) as record_count 
FROM {{table_name}}
UNION ALL
SELECT 
  'Archive' as table_name, 
  COUNT(*) as record_count 
FROM {{table_name}}_archive;`,
    variables: {
      table_name: {
        description: 'Table name to archive from',
        example: 'old_orders',
        type: 'string'
      },
      days: {
        description: 'Archive records older than N days',
        example: '365',
        type: 'number'
      }
    }
  },

  // Performance & Monitoring
  {
    name: 'Table Size Analysis',
    description: 'Get size information for all tables in the database',
    category: 'maintenance',
    database_type: 'postgresql',
    tags: ['database', 'size', 'performance'],
    sql_template: `SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size,
  pg_stat_user_tables.n_live_tup AS row_count
FROM pg_tables
LEFT JOIN pg_stat_user_tables 
  ON pg_tables.tablename = pg_stat_user_tables.relname
  AND pg_tables.schemaname = pg_stat_user_tables.schemaname
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT {{limit}};`,
    variables: {
      limit: {
        description: 'Number of tables to show',
        example: '20',
        type: 'number'
      }
    }
  },
  {
    name: 'Slow Query Analysis',
    description: 'Identify long-running or frequently slow queries',
    category: 'maintenance',
    database_type: 'postgresql',
    tags: ['performance', 'slow-queries', 'monitoring'],
    sql_template: `SELECT 
  query,
  calls,
  total_time / 1000 as total_seconds,
  mean_time / 1000 as mean_seconds,
  max_time / 1000 as max_seconds,
  stddev_time / 1000 as stddev_seconds,
  rows
FROM pg_stat_statements
WHERE mean_time > {{threshold_ms}}
ORDER BY mean_time DESC
LIMIT {{limit}};`,
    variables: {
      threshold_ms: {
        description: 'Minimum mean execution time in milliseconds',
        example: '1000',
        type: 'number'
      },
      limit: {
        description: 'Number of queries to return',
        example: '20',
        type: 'number'
      }
    }
  },

  // Data Updates & Changes
  {
    name: 'Bulk Update Template',
    description: 'Update multiple records matching a condition',
    category: 'data_changes',
    database_type: 'postgresql',
    tags: ['update', 'bulk', 'maintenance'],
    sql_template: `-- Preview affected records first
SELECT * FROM {{table_name}}
WHERE {{condition}};

-- Uncomment to execute update
-- UPDATE {{table_name}}
-- SET {{column_name}} = '{{new_value}}'
-- WHERE {{condition}};`,
    variables: {
      table_name: {
        description: 'Table to update',
        example: 'customers',
        type: 'string'
      },
      column_name: {
        description: 'Column to update',
        example: 'status',
        type: 'string'
      },
      new_value: {
        description: 'New value to set',
        example: 'active',
        type: 'string'
      },
      condition: {
        description: 'WHERE clause condition',
        example: 'status = \'pending\' AND created_at < CURRENT_DATE - 30',
        type: 'string'
      }
    }
  },

  // MySQL Specific
  {
    name: 'Find Customer by Email (MySQL)',
    description: 'Search for a customer using their email address',
    category: 'customer_inquiries',
    database_type: 'mysql',
    tags: ['customer', 'search', 'user'],
    sql_template: `SELECT 
  id,
  email,
  first_name,
  last_name,
  created_at,
  last_login,
  status
FROM customers
WHERE email = '{{email}}';`
  },
  {
    name: 'Daily Sales Report (MySQL)',
    description: 'Generate daily sales summary for a specific date',
    category: 'reports',
    database_type: 'mysql',
    tags: ['sales', 'daily', 'revenue'],
    sql_template: `SELECT 
  DATE(created_at) as sale_date,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value,
  COUNT(DISTINCT customer_id) as unique_customers
FROM orders
WHERE DATE(created_at) = '{{date}}'
GROUP BY DATE(created_at);`
  },

  // SQL Server Specific
  {
    name: 'Find Customer by Email (SQL Server)',
    description: 'Search for a customer using their email address',
    category: 'customer_inquiries',
    database_type: 'sqlserver',
    tags: ['customer', 'search', 'user'],
    sql_template: `SELECT 
  id,
  email,
  first_name,
  last_name,
  created_at,
  last_login,
  status
FROM customers
WHERE email = '{{email}}';`
  },
  {
    name: 'Table Size Analysis (SQL Server)',
    description: 'Get size information for all tables in the database',
    category: 'maintenance',
    database_type: 'sqlserver',
    tags: ['database', 'size', 'performance'],
    sql_template: `SELECT 
  t.NAME AS TableName,
  s.Name AS SchemaName,
  p.rows AS RowCounts,
  CAST(ROUND((SUM(a.total_pages) * 8) / 1024.00, 2) AS NUMERIC(36, 2)) AS TotalSpaceMB,
  CAST(ROUND((SUM(a.used_pages) * 8) / 1024.00, 2) AS NUMERIC(36, 2)) AS UsedSpaceMB,
  CAST(ROUND((SUM(a.total_pages) - SUM(a.used_pages)) * 8 / 1024.00, 2) AS NUMERIC(36, 2)) AS UnusedSpaceMB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
LEFT OUTER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE t.NAME NOT LIKE 'dt%' 
  AND t.is_ms_shipped = 0
  AND i.OBJECT_ID > 255 
GROUP BY t.Name, s.Name, p.Rows
ORDER BY TotalSpaceMB DESC;`
  },

  // Testing & Development
  {
    name: 'Generate Test Data',
    description: 'Insert sample test records for development',
    category: 'testing',
    database_type: 'postgresql',
    tags: ['testing', 'development', 'seed'],
    sql_template: `-- Generate {{count}} test customer records
INSERT INTO customers (email, first_name, last_name, status, created_at)
SELECT 
  'test_' || generate_series || '@example.com' as email,
  'FirstName' || generate_series as first_name,
  'LastName' || generate_series as last_name,
  'active' as status,
  CURRENT_DATE - (random() * 365)::int as created_at
FROM generate_series(1, {{count}});

-- Verify insertion
SELECT COUNT(*) as inserted_count FROM customers WHERE email LIKE 'test_%@example.com';`,
    variables: {
      count: {
        description: 'Number of test records to create',
        example: '100',
        type: 'number'
      }
    }
  },

  // Data Export Queries
  {
    name: 'Export Customer List',
    description: 'Export customer data with proper formatting for CSV',
    category: 'reports',
    database_type: 'postgresql',
    tags: ['export', 'customers', 'csv'],
    sql_template: `SELECT 
  id as "Customer ID",
  email as "Email Address",
  first_name || ' ' || last_name as "Full Name",
  status as "Status",
  TO_CHAR(created_at, 'YYYY-MM-DD') as "Registration Date",
  TO_CHAR(last_login, 'YYYY-MM-DD HH24:MI:SS') as "Last Login"
FROM customers
WHERE status = '{{status}}'
ORDER BY created_at DESC
LIMIT {{limit}};`,
    variables: {
      status: {
        description: 'Customer status filter',
        example: 'active',
        type: 'string'
      },
      limit: {
        description: 'Maximum records to export',
        example: '1000',
        type: 'number'
      }
    }
  }
];
