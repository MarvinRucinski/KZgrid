# KZgrid - GitHub Copilot Instructions

## Project Overview

KZgrid is a geogrid game application built for KŻ PWr (Koło Żeglarskie Politechnika Wrocławska). It features a 3x3 interactive grid where users match people with categories based on their achievements and affiliations.

**Tech Stack:**
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## Code Style and Conventions

### TypeScript
- Use TypeScript with strict mode enabled
- Define interfaces for all data structures
- Use explicit types; avoid `any`
- Follow the existing naming convention:
  - Interfaces: PascalCase (e.g., `User`, `Category`, `CellData`)
  - Functions: camelCase (e.g., `loadCategories`, `searchUsers`)
  - Components: PascalCase (e.g., `Grid`)

### React and Next.js
- Use functional components with hooks
- Mark client components with `'use client'` directive when needed
- Use Next.js App Router (not Pages Router)
- Import from `@/` for absolute paths (configured in tsconfig.json)
- Use Next.js `Image` component for images (not `<img>`)

### Supabase
- Always use the typed Supabase client from `@/lib/supabase`
- Follow the Database type definitions in `@/types/database`
- Handle errors from Supabase queries with try-catch
- Use parameterized queries to prevent SQL injection

### Styling
- Use Tailwind CSS utility classes
- Follow the existing color scheme and spacing conventions
- Keep responsive design in mind (mobile-first approach)
- Use semantic color classes (e.g., `bg-green-100` for correct answers, `bg-red-100` for incorrect)

## Development Workflow

### Setup
```bash
npm install              # Install dependencies
npm run dev             # Start development server on localhost:3000
npm run build           # Build for production
npm run lint            # Run ESLint
npx tsc --noEmit        # Run TypeScript type checking
```

### Testing Changes
1. Always run `npm run lint` before committing
2. Run `npx tsc --noEmit` to ensure type safety
3. Test the application locally with `npm run dev`
4. Verify the build works with `npm run build`

### Environment Variables
The application requires these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Use `.env.local.example` as a template for local development.

## Architecture Guidelines

### File Structure
```
app/                    # Next.js App Router pages
├── layout.tsx         # Root layout
├── page.tsx           # Home page
└── globals.css        # Global styles

components/            # React components
└── Grid.tsx          # Main 3x3 grid component (259 lines)

lib/                   # Utility libraries
└── supabase.ts       # Supabase client initialization

types/                 # TypeScript type definitions
└── database.ts       # Database schema types

supabase/              # Database schema and migrations
└── migrations/
    └── 00001_initial_schema.sql
```

### Database Schema
The application uses 4 main tables:
1. **categories** - Row and column categories (type: 'row' | 'column')
2. **users** - User information (first_name, last_name, photo_url)
3. **user_categories** - Junction table linking users to categories
4. **grid_games** - Optional table for storing game states

### Component Structure
The main `Grid.tsx` component manages:
- State for categories (rows and columns)
- State for grid cells (3x3 array)
- User search functionality
- Answer validation logic
- Modal for user selection

## Common Tasks

### Adding a New Feature
1. Check existing code patterns in `components/Grid.tsx`
2. Add necessary TypeScript types to `types/database.ts` if needed
3. Update the Supabase client queries in the component
4. Style with Tailwind CSS to match existing design
5. Test thoroughly in development mode
6. Run linter and type checker before committing

### Modifying the Database
1. Create a new migration file in `supabase/migrations/`
2. Follow the naming convention: `XXXXX_description.sql`
3. Update TypeScript types in `types/database.ts` to match schema changes
4. Update documentation if schema changes are significant

### Updating Dependencies
1. Check compatibility with Next.js 16, React 19, and TypeScript 5
2. Test the application after updating
3. Update package.json and package-lock.json
4. Verify CI/CD pipeline still passes

## Best Practices

### Code Quality
- Write clean, maintainable code that follows existing patterns
- Add comments only when the code's purpose is not immediately clear
- Keep functions small and focused on a single responsibility
- Use meaningful variable and function names

### Performance
- Optimize Supabase queries (use `.select()` to specify needed columns)
- Use React hooks properly (useEffect dependencies, useMemo when needed)
- Lazy load components when appropriate
- Optimize images with Next.js Image component

### Security
- Never commit `.env.local` or other files with secrets
- Always use environment variables for sensitive data
- Validate user input before sending to database
- Use Supabase's built-in security features (RLS when applicable)

### Error Handling
- Always handle errors from async operations
- Provide user-friendly error messages
- Log errors for debugging when appropriate
- Use try-catch blocks for Supabase queries

## Testing

### CI/CD Pipeline
The repository has GitHub Actions workflows that run on push and PR:
1. **Lint** - Runs ESLint on all code
2. **Build** - Builds the Next.js application
3. **Type Check** - Runs TypeScript compiler

Ensure all checks pass before merging.

### Manual Testing Checklist
- [ ] Application runs without errors in development mode
- [ ] Grid loads with categories from database
- [ ] User search works and shows suggestions
- [ ] Cell validation works correctly (green for correct, red for incorrect)
- [ ] UI is responsive on different screen sizes
- [ ] No console errors or warnings
- [ ] TypeScript has no type errors
- [ ] ESLint passes with no warnings

## Documentation

Keep these documentation files updated:
- **README.md** - Project overview and quick start
- **ARCHITECTURE.md** - Technical architecture details
- **DEPLOYMENT.md** - Deployment instructions
- **PROJECT-STRUCTURE.md** - File structure reference

## Common Pitfalls to Avoid

1. **Don't use Pages Router patterns** - This project uses App Router
2. **Don't forget 'use client'** - Client components need this directive
3. **Don't use plain `<img>` tags** - Use Next.js `Image` component
4. **Don't hardcode values** - Use environment variables and database
5. **Don't skip error handling** - Always handle Supabase query errors
6. **Don't commit sensitive data** - Use environment variables
7. **Don't break TypeScript types** - Keep strict typing throughout

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Getting Help

1. Check the documentation files in the repository
2. Review existing code patterns in `components/Grid.tsx`
3. Consult the external documentation links above
4. Check GitHub Issues for known problems

---

**Note:** This is a production-ready application with active deployment. Always test changes thoroughly before merging to main branch.
