-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('row', 'column')),
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_categories junction table
CREATE TABLE IF NOT EXISTS user_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Create grid_games table
CREATE TABLE IF NOT EXISTS grid_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  row_categories TEXT[] NOT NULL,
  column_categories TEXT[] NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_position ON categories(position);
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_category_id ON user_categories(category_id);

-- Insert sample categories
INSERT INTO categories (name, type, position) VALUES
  ('Sekcja Turystyki', 'row', 0),
  ('Sekcja Fotografii', 'row', 1),
  ('Sekcja Żeglarstwa', 'row', 2),
  ('Złota Odznaka', 'column', 0),
  ('Srebrna Odznaka', 'column', 1),
  ('Brązowa Odznaka', 'column', 2);

-- Insert sample users
INSERT INTO users (first_name, last_name, photo_url) VALUES
  ('Jan', 'Kowalski', null),
  ('Anna', 'Nowak', null),
  ('Piotr', 'Wiśniewski', null),
  ('Maria', 'Wójcik', null),
  ('Krzysztof', 'Kamiński', null),
  ('Ewa', 'Lewandowska', null);

-- Associate users with categories (sample data)
INSERT INTO user_categories (user_id, category_id)
SELECT u.id, c.id
FROM users u, categories c
WHERE 
  (u.first_name = 'Jan' AND u.last_name = 'Kowalski' AND c.name IN ('Sekcja Turystyki', 'Złota Odznaka'))
  OR (u.first_name = 'Anna' AND u.last_name = 'Nowak' AND c.name IN ('Sekcja Fotografii', 'Srebrna Odznaka'))
  OR (u.first_name = 'Piotr' AND u.last_name = 'Wiśniewski' AND c.name IN ('Sekcja Żeglarstwa', 'Brązowa Odznaka'))
  OR (u.first_name = 'Maria' AND u.last_name = 'Wójcik' AND c.name IN ('Sekcja Turystyki', 'Srebrna Odznaka'))
  OR (u.first_name = 'Krzysztof' AND u.last_name = 'Kamiński' AND c.name IN ('Sekcja Fotografii', 'Brązowa Odznaka'))
  OR (u.first_name = 'Ewa' AND u.last_name = 'Lewandowska' AND c.name IN ('Sekcja Żeglarstwa', 'Złota Odznaka'));
