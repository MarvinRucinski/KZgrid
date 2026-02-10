# KZgrid Setup Guide

This guide will help you set up the KZgrid application with Supabase.

## Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **A Supabase account** - [Sign up here](https://supabase.com/)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MarvinRucinski/KZgrid.git
cd KZgrid
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: KZgrid (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to you
5. Wait for the project to finish setting up (this takes about 2 minutes)

### 4. Get Your Supabase Credentials

1. Go to your project dashboard
2. Click on the **Settings** icon (gear icon) in the left sidebar
3. Click on **API** in the Settings menu
4. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

### 5. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` in your text editor

3. Replace the placeholder values with your actual Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 6. Set Up the Database

1. Go back to your Supabase project dashboard
2. Click on the **SQL Editor** icon in the left sidebar
3. Click **+ New Query**
4. Open the file `supabase/migrations/00001_initial_schema.sql` in your code editor
5. Copy all the contents
6. Paste it into the SQL Editor in Supabase
7. Click **Run** (or press Ctrl/Cmd + Enter)
8. You should see "Success. No rows returned"

### 7. Verify Database Setup

1. In Supabase, click on **Table Editor** in the left sidebar
2. You should see 4 tables:
   - `categories` (with 6 rows)
   - `users` (with 6 rows)
   - `user_categories` (with multiple rows)
   - `grid_games` (empty)

### 8. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Application

1. You should see a 3x3 grid with:
   - Row headers: Sekcja Turystyki, Sekcja Fotografii, Sekcja Żeglarstwa
   - Column headers: Złota Odznaka, Srebrna Odznaka, Brązowa Odznaka

2. Click on any empty cell

3. A modal should appear with a search box

4. Type a name (e.g., "Jan" or "Anna")

5. Select a user from the dropdown

6. The cell will turn:
   - **Green** if the user matches both categories (correct answer)
   - **Red** if the user doesn't match both categories (incorrect answer)

## Adding Your Own Data

### Add New Categories

In Supabase SQL Editor:

```sql
-- Add a row category
INSERT INTO categories (name, type, position) VALUES
  ('Sekcja Nurkowania', 'row', 3);

-- Add a column category
INSERT INTO categories (name, type, position) VALUES
  ('Odznaka Uczestnictwa', 'column', 3);
```

### Add New Users

In Supabase SQL Editor:

```sql
INSERT INTO users (first_name, last_name, photo_url) VALUES
  ('Tomasz', 'Nowak', 'https://example.com/photo.jpg');
```

**Note**: For photos, you can:
- Use a URL from any public image source
- Upload to Supabase Storage and use that URL
- Leave as `null` for no photo

### Link Users to Categories

```sql
-- First, get the user ID and category IDs
-- You can find these in the Table Editor

-- Then link them
INSERT INTO user_categories (user_id, category_id) VALUES
  ('user-uuid-here', 'category-uuid-here');
```

**Tip**: A user should be linked to at least 2 categories (one row and one column) to be a valid answer in the grid.

## Uploading User Photos to Supabase

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name it `user-photos`
4. Set it to **Public**
5. Upload photos
6. Copy the public URL
7. Update the user's `photo_url` in the database

## Troubleshooting

### "Error: supabaseUrl is required"
- Make sure you created the `.env.local` file
- Verify the environment variables are correct
- Restart the development server (`npm run dev`)

### Grid shows no categories
- Verify the database migration ran successfully
- Check the `categories` table has data
- Check browser console for errors

### Users not showing in search
- Verify the `users` table has data
- Check Supabase API keys are correct
- Check browser console for errors

### Images not loading
- Verify the `photo_url` is a valid public URL
- Check if the domain is accessible
- Try a different image URL

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

## Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Open an issue on GitHub

## License

MIT License - see LICENSE file for details
