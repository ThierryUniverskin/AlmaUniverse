# Alma Universe

Clinical management web app for doctors - premium patient CRUD with luxury medical aesthetic.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom design system
- **State**: React Context (no external state library)
- **Storage**: localStorage (demo mode - no backend)
- **UI Library**: Custom components in `src/components/ui/`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Unauthenticated routes (login)
│   ├── (dashboard)/       # Authenticated routes (requires login)
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Entry redirect
├── components/
│   ├── ui/                # Reusable UI primitives (Button, Input, Card, etc.)
│   ├── layout/            # App shell (Header, Sidebar, MainLayout)
│   ├── auth/              # Auth components (ProtectedRoute)
│   └── patients/          # Patient domain components
├── context/               # React Context providers (Auth, Patient)
├── hooks/                 # Custom hooks (useLocalStorage, useDebounce)
├── lib/                   # Utilities (utils, validation, storage, constants)
└── types/                 # TypeScript type definitions
```

## Essential Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

## Git Workflow

Create a branch for each feature or bug fix:

```bash
git checkout -b feature/short-description
git checkout -b fix/short-description
```

Merge to main via PR after review.

## Demo Credentials

- Email: `doctor@alma.health`
- Password: `alma2024`

## Key Files

| Purpose | Location |
|---------|----------|
| Type definitions | `src/types/index.ts` |
| App constants | `src/lib/constants.ts` |
| Form validation | `src/lib/validation.ts` |
| Storage utilities | `src/lib/storage.ts` |
| Auth state | `src/context/AuthContext.tsx` |
| Patient state | `src/context/PatientContext.tsx` |
| Design tokens | `tailwind.config.ts` |

## Design System

Custom Tailwind colors:
- `ivory-*` - Warm neutral backgrounds
- `sage-*` - Primary accent (medical luxury green)
- `stone-*` - Text and borders
- `error-*`, `success-*`, `warning-*` - Semantic colors

Fonts:
- Display: `font-display` (Fraunces - serif)
- Body: `font-sans` (DM Sans)

## Additional Documentation

When working on specific areas, check these files:

| Topic | File |
|-------|------|
| Architectural patterns & conventions | `.claude/docs/architectural_patterns.md` |
