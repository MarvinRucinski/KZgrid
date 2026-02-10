# KZgrid Application Structure

## Application Flow

```
User visits localhost:3000
     ↓
Main Page (app/page.tsx)
     ↓
Grid Component (components/Grid.tsx)
     ↓
Loads categories from Supabase
     ↓
Displays 3x3 interactive grid
```

## User Interaction Flow

```
1. User sees 3x3 grid with category headers
   ├─ Row categories (left side)
   └─ Column categories (top)

2. User clicks on empty cell
   ↓
3. Search modal appears
   ↓
4. User types name
   ↓
5. Autocomplete suggestions appear
   ↓
6. User selects a name
   ↓
7. Application validates:
   - Does user belong to row category? ✓/✗
   - Does user belong to column category? ✓/✗
   ↓
8. Cell updates:
   - Green background = Correct answer
   - Red background = Incorrect answer
```

## Grid Layout

```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│             │ Złota        │ Srebrna      │ Brązowa      │
│             │ Odznaka      │ Odznaka      │ Odznaka      │
├─────────────┼──────────────┼──────────────┼──────────────┤
│ Sekcja      │              │              │              │
│ Turystyki   │    Cell      │    Cell      │    Cell      │
├─────────────┼──────────────┼──────────────┼──────────────┤
│ Sekcja      │              │              │              │
│ Fotografii  │    Cell      │    Cell      │    Cell      │
├─────────────┼──────────────┼──────────────┼──────────────┤
│ Sekcja      │              │              │              │
│ Żeglarstwa  │    Cell      │    Cell      │    Cell      │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

## Database Structure

```
┌─────────────┐
│ categories  │
├─────────────┤
│ id (UUID)   │
│ name        │◄───┐
│ type        │    │
│ position    │    │
└─────────────┘    │
                   │
                   │    ┌──────────────────┐
                   │    │ user_categories  │
                   │    ├──────────────────┤
                   └────│ category_id      │
                        │ user_id          │───┐
                        └──────────────────┘   │
                                               │
                        ┌─────────────┐        │
                        │   users     │        │
                        ├─────────────┤        │
                        │ id (UUID)   │◄───────┘
                        │ first_name  │
                        │ last_name   │
                        │ photo_url   │
                        └─────────────┘
```

## Component Hierarchy

```
app/
├── layout.tsx (Root layout)
└── page.tsx (Home page)
    └── Grid component
        ├── State Management
        │   ├── rowCategories
        │   ├── columnCategories
        │   ├── cells (9 cells with user data)
        │   ├── activeCell
        │   └── searchQuery
        │
        ├── Functions
        │   ├── loadCategories()
        │   ├── searchUsers()
        │   ├── validateAnswer()
        │   ├── handleCellClick()
        │   └── handleUserSelect()
        │
        └── UI Elements
            ├── Grid Headers (categories)
            ├── Grid Cells (9 cells)
            └── Search Modal
                ├── Input field
                └── Suggestion list
```

## Sample Data Relationships

Example valid answers in the grid:

```
User: Jan Kowalski
Categories: Sekcja Turystyki + Złota Odznaka = ✓ CORRECT

User: Anna Nowak  
Categories: Sekcja Fotografii + Srebrna Odznaka = ✓ CORRECT

User: Jan Kowalski
Categories: Sekcja Żeglarstwa + Złota Odznaka = ✗ INCORRECT
(He has Złota Odznaka but not in Sekcja Żeglarstwa)
```

## Technology Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Image Optimization**: Next.js Image component
- **State Management**: React hooks (useState, useEffect)

## Key Features

1. ✅ Dynamic data loading from database
2. ✅ Real-time search with autocomplete
3. ✅ Visual feedback (green/red cells)
4. ✅ Answer validation against database
5. ✅ Responsive design with Tailwind CSS
6. ✅ Image support for user photos
7. ✅ Type-safe with TypeScript
8. ✅ Optimized images with Next.js
