# KZgrid

GeoGrid for KŻ PWr - A geogrid game built with Next.js and Supabase.

## Features

- 3x3 interactive grid game
- Dynamic categories (rows and columns)
- User database with photos
- Autocomplete search for users
- Answer validation
- Supabase backend for data storage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup

1. Clone the repository:
```bash
git clone https://github.com/MarvinRucinski/KZgrid.git
cd KZgrid
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project in Supabase
   - Go to Settings > API to get your project URL and anon key
   - Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the database migration:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy the contents of `supabase/migrations/00001_initial_schema.sql`
   - Paste and run the SQL script

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. Click on any empty cell in the 3x3 grid
2. A search modal will appear
3. Type a name to search for users
4. Select a user from the suggestions
5. The app will validate if the user matches both the row and column categories
6. Cells turn green for correct answers and red for incorrect ones

## Database Schema

The application uses the following tables:

- **categories**: Stores row and column categories
- **users**: Stores user information (name and photo)
- **user_categories**: Junction table linking users to categories
- **grid_games**: (Optional) For storing game states

## Customization

### Adding New Categories

You can add new categories via Supabase dashboard or SQL:

```sql
INSERT INTO categories (name, type, position) VALUES
  ('Your Category Name', 'row', 3);  -- or 'column' for column categories
```

### Adding New Users

Add users via Supabase dashboard or SQL:

```sql
INSERT INTO users (first_name, last_name, photo_url) VALUES
  ('John', 'Doe', 'https://example.com/photo.jpg');
```

### Linking Users to Categories

```sql
INSERT INTO user_categories (user_id, category_id)
VALUES 
  ('user-uuid-here', 'category-uuid-here');
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MarvinRucinski/KZgrid&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20credentials%20required&envLink=https://github.com/MarvinRucinski/KZgrid/blob/main/DEPLOYMENT.md)

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## License

MIT License - see LICENSE file for details
