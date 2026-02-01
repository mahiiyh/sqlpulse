-- Add query_templates table
CREATE TABLE IF NOT EXISTS query_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sql_template TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    tags TEXT[] NOT NULL DEFAULT '{}',
    variables JSONB,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_query_templates_category ON query_templates(category);
CREATE INDEX IF NOT EXISTS idx_query_templates_created_by ON query_templates(created_by);

-- Insert some sample templates
INSERT INTO query_templates (name, description, sql_template, category, tags, created_by) VALUES
('Daily Sales Report', 'Get total sales for a specific date', 'SELECT DATE(order_date) as date, COUNT(*) as order_count, SUM(total_amount) as total_sales FROM orders WHERE DATE(order_date) = ''{{date}}'' GROUP BY DATE(order_date)', 'Reporting', ARRAY['sales', 'daily', 'reporting'], 1),
('Top Customers by Revenue', 'Find top N customers by revenue', 'SELECT customer_id, customer_name, SUM(order_total) as total_revenue FROM orders GROUP BY customer_id, customer_name ORDER BY total_revenue DESC LIMIT {{limit}}', 'Analytics', ARRAY['customers', 'revenue', 'analytics'], 1),
('Slow Query Analysis', 'Find queries that took longer than X seconds', 'SELECT query_name, execution_time_ms, executed_at FROM execution_history WHERE execution_time_ms > {{threshold_ms}} AND executed_at >= ''{{date_from}}'' ORDER BY execution_time_ms DESC', 'Performance', ARRAY['performance', 'monitoring'], 1),
('Database Table Size', 'Get size of all tables in database', 'SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size FROM information_schema.tables WHERE table_schema = ''public'' ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC', 'Database', ARRAY['database', 'monitoring', 'size'], 1),
('User Activity Summary', 'Summarize user activity for a date range', 'SELECT u.name, u.email, COUNT(e.id) as executions_count, AVG(e.execution_time_ms) as avg_time_ms FROM users u LEFT JOIN execution_history e ON u.id = e.executed_by WHERE e.executed_at BETWEEN ''{{date_from}}'' AND ''{{date_to}}'' GROUP BY u.id, u.name, u.email ORDER BY executions_count DESC', 'Reporting', ARRAY['users', 'activity', 'reporting'], 1)
ON CONFLICT DO NOTHING;
