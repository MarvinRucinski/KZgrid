-- Create answer_statistics table for rarity tracking
CREATE TABLE IF NOT EXISTS public.answer_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  row_category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  column_category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  usage_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, row_category_id, column_category_id)
);

CREATE INDEX IF NOT EXISTS idx_answer_stats_row_col
  ON public.answer_statistics (row_category_id, column_category_id);

-- Enable RLS and allow public read/write for client-side tracking
ALTER TABLE public.answer_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read answer_statistics"
ON public.answer_statistics
FOR SELECT
TO anon
USING (true);

CREATE POLICY "public insert answer_statistics"
ON public.answer_statistics
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "public update answer_statistics"
ON public.answer_statistics
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
