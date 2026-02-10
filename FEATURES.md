# KZgrid - New Features Documentation

## Recent Improvements

This document describes the three new features added to the KZgrid game to improve user experience.

### 1. Answer Correction Feature

**Problem**: Previously, once a user entered a wrong answer, they couldn't change it and had to live with the mistake.

**Solution**: 
- Users can now click on cells with incorrect (red) answers to change them
- Correct (green) answers remain locked to prevent accidental changes
- Visual feedback: incorrect cells show a pointer cursor and darker border on hover
- This allows players to learn from mistakes and try again

**Implementation Details**:
- Modified `handleCellClick` to allow clicking on cells where `isCorrect === false`
- Updated cell CSS classes to show different cursor styles for editable vs. locked cells

### 2. Photo Display

**Status**: Already implemented and working

**Features**:
- User photos appear in the search modal while typing
- Photos are displayed as circular avatars (40x40px in modal, 64x64px in cells)
- Photos appear in filled cells alongside the user's name
- Uses Next.js Image component for optimized loading

### 3. Rarity Ranking System

**Problem**: Players had no sense of how unique or popular their answers were compared to others.

**Solution**: Inspired by geogrid, we added a rarity system that shows how popular each correct answer is.

**Rarity Tiers** (from rarest to most common):
1. **Legendarny (Legendary)** ⭐ - Top 2% of answers
2. **Epicka (Epic)** 💎 - Top 2-10% of answers
3. **Rzadka (Rare)** 💠 - Top 10-30% of answers
4. **Nieczęsta (Uncommon)** ✨ - Top 30-60% of answers
5. **Powszechna (Common)** ⚪ - Remaining 40% of answers

**How It Works**:
- Each correct answer is tracked in the `answer_statistics` database table
- The system counts how many times each user has been chosen for each category combination
- Rarity is calculated based on percentile ranking (lower usage = rarer answer)
- First-time answers are always marked as "Legendary"
- Rarity badges appear below the user's name in correct (green) cells

**Implementation Details**:
- New database table: `answer_statistics`
  - Tracks: `user_id`, `row_category_id`, `column_category_id`, `usage_count`
  - Unique constraint prevents duplicate entries
  - Auto-updates `usage_count` when the same answer is used again
- Functions:
  - `trackAnswer()`: Records or updates answer usage
  - `calculateRarity()`: Determines rarity tier based on percentile
  - `getRarityInfo()`: Returns display information (label, colors, icon)

## Database Migration

To enable the rarity system, run the following migration in your Supabase SQL editor:

```sql
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_answer_statistics_user_id ON answer_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_statistics_categories ON answer_statistics(row_category_id, column_category_id);
CREATE INDEX IF NOT EXISTS idx_answer_statistics_usage_count ON answer_statistics(usage_count);
```

## Technical Notes

### Type Safety
- Created a custom type-safe wrapper (`statsClient`) for the new `answer_statistics` table
- This allows TypeScript compilation without modifying the main Database type
- All operations are strongly typed to prevent runtime errors

### Error Handling
- All statistics operations are wrapped in try-catch blocks
- Errors are logged but don't break the game flow
- If statistics fail, the game continues normally (rarity just won't be displayed)

### Performance
- Queries are optimized with database indexes
- Rarity calculation only runs for correct answers
- Uses Supabase's efficient query builder

## User Experience

**Before**:
- Wrong answers were permanent
- No feedback on answer popularity
- Photos only in final cells

**After**:
- Wrong answers can be corrected
- Rarity system shows answer uniqueness
- Visual feedback throughout (photos, badges, colors)

## Future Enhancements

Possible improvements for the future:
- Global leaderboard showing rarest answers
- Statistics page showing personal best rarities
- Achievements for getting legendary answers
- Daily challenges with specific rarity goals
