# Alma Universe

Clinical management web app for health professionals - premium patient CRUD with luxury medical aesthetic.

**Live URL:** https://alma-universe.vercel.app
**Login:** `doctor@alma.health` / `alma2024`

---

## Project Status

### Current State: MVP Complete with Supabase Backend

The app is fully functional with real authentication and database persistence via Supabase.

### Features Completed

| Feature | Status | Notes |
|---------|--------|-------|
| Login page | Done | Supabase Auth |
| Dashboard | Done | Stats, recent patients, hero image |
| Patient list | Done | Search, filter, sort |
| Add patient | Done | Persists to Supabase |
| Edit patient | Done | Update patient details |
| Delete patient | Done | Remove patient records |
| View patient | Done | Detail page |
| My Account page | Done | Profile editing with live preview |
| Security settings | Done | Password change |
| Responsive sidebar | Done | Collapsible with hover toggle |
| Toast notifications | Done | Success/error/info states |
| Unsaved changes warning | Done | Modal on navigation |
| Multi-tenant data | Done | RLS ensures doctors only see their patients |
| Clinical Documentation | Done | 5-step flow: Patient → Health → Photos → Concerns → EBD Devices |

### Clinical Documentation Flow

The clinical documentation wizard guides physicians through a 5-step process:

1. **Patient Selection** - Select existing or create new patient record
2. **Medical History** - Capture reproductive, cancer, skin conditions, allergies, medications
3. **Photo Collection** - Capture frontal + profile photos with remove.bg background removal
4. **Skin Concerns** - Select from 17 medical skin conditions across 4 categories (drag & drop priority)
5. **Treatment Selection** - Select treatments from 4 categories (accordion UI):
   - **EBD Devices** - Alma device catalog (read-only from database)
   - **Toxins** - Custom doctor procedures (e.g., Botox, Dysport)
   - **Injectables** - Custom doctor procedures (e.g., Juvederm, Restylane)
   - **Other Aesthetic Procedures** - Custom procedures with subcategories

Key files:
- `src/app/(dashboard)/clinical-documentation/new/page.tsx` - Main wizard page
- `src/components/clinical-documentation/` - Step components
- `src/lib/skinConcerns.ts` - Skin concern categories and items
- `src/lib/ebdDevices.ts` - EBD device catalog and database fetch
- `src/lib/doctorProcedures.ts` - Custom procedures CRUD
- `src/lib/treatmentCategories.ts` - Treatment category constants
- `src/lib/backgroundRemoval.ts` - remove.bg API integration

### Pending Features

- User registration (currently manual in Supabase dashboard)
- Email verification
- Password reset flow

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom design system
- **State**: React Context (AuthContext, PatientContext)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Public routes (login)
│   ├── (dashboard)/       # Protected routes
│   │   ├── account/       # My Account page
│   │   ├── dashboard/     # Dashboard home
│   │   └── patients/      # Patient management
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Entry redirect
├── components/
│   ├── account/           # Profile components
│   ├── auth/              # ProtectedRoute wrapper
│   ├── layout/            # Header, Sidebar, MainLayout
│   ├── patients/          # Patient domain components
│   └── ui/                # Reusable primitives
├── context/
│   ├── AuthContext.tsx    # Supabase Auth integration
│   └── PatientContext.tsx # Supabase patient CRUD
├── lib/
│   ├── constants.ts       # Dropdown options
│   ├── supabase.ts        # Supabase client
│   ├── utils.ts           # Utility functions
│   └── validation.ts      # Form validation
└── types/
    ├── index.ts           # App type definitions
    └── database.ts        # Supabase table types
```

---

## Supabase Setup

**Schema file:** `supabase/schema.sql`

### Tables
- `doctors` - User profiles (linked to auth.users)
- `patients` - Patient records (linked to doctor via doctor_id)
- `photo_sessions` - Patient photo sessions (frontal, left, right profiles)
- `clinical_evaluation_sessions` - Clinical documentation sessions
- `ebd_devices` - Master catalog of 19 Energy-Based Devices (lasers, IPL, plasma)
- `doctor_devices` - Junction table: which devices each doctor has access to
- `country_devices` - Junction table: which devices available per country
- `doctor_procedures` - Custom procedures (Toxins, Injectables, Other) per doctor

### EBD Devices Database
The EBD devices are stored in database with fallback to static data. To set up:
1. Run `supabase/migrations/001_add_ebd_devices.sql` - Creates tables
2. Run `supabase/seed-ebd-devices.sql` - Seeds 19 devices

### Custom Procedures Database
Custom procedures (Toxins, Injectables, Other) are stored per doctor:
1. Run `supabase/migrations/002_add_doctor_procedures.sql` - Creates doctor_procedures table with RLS

### Row Level Security
All tables have RLS enabled. Doctors can only access their own data.
EBD devices are public read (catalog data).

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

Set in `.env.local` (local) and Vercel dashboard (production).

### Implementation Notes

**Direct Fetch Pattern:** All Supabase operations (auth, CRUD) use direct `fetch()` calls to the Supabase REST API instead of the Supabase JS client methods. This bypasses internal locking mechanisms that caused hanging issues with React's component lifecycle.

**React Strict Mode:** Disabled in `next.config.js` to prevent double-invocation of effects that conflicted with Supabase auth.

---

## Essential Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

### Deployment

**IMPORTANT:** Deployment to Vercel is NOT automatic. You must deploy manually:

```bash
npx vercel --prod --yes   # Deploy to production
```

This uploads the build to Vercel and deploys to https://alma-universe.vercel.app

---

## Design System

**Colors:**
- `purple-*` - Primary brand color
- `stone-*` - Text and borders
- `success-*` - Green for success
- `error-*` - Red for errors

**Typography:** Inter (sans-serif)

---

## Roadmap

### Phase 2: Auth Enhancements
- Registration page
- Email verification
- Password reset flow

### Phase 3: Patient Features
- Patient notes/history
- Patient search improvements

### Phase 4: Future Ideas
- Appointments/scheduling
- Document uploads
- Analytics dashboard

---

## Key Files Reference

| Purpose | Location |
|---------|----------|
| Type definitions | `src/types/index.ts` |
| Database types | `src/types/database.ts` |
| Supabase client | `src/lib/supabase.ts` |
| Auth context | `src/context/AuthContext.tsx` |
| Patient CRUD | `src/context/PatientContext.tsx` |
| Database schema | `supabase/schema.sql` |
| Environment example | `.env.example` |
