-- Create table to track answer statistics
CREATE TABLE IF NOT EXISTS answer_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  row_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  column_category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, row_category_id, column_category_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_answer_statistics_user_id ON answer_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_statistics_categories ON answer_statistics(row_category_id, column_category_id);
CREATE INDEX IF NOT EXISTS idx_answer_statistics_usage_count ON answer_statistics(usage_count);
