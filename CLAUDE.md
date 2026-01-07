# Alma Universe

Clinical management web app for health professionals - premium patient CRUD with luxury medical aesthetic.

**Live URL:** https://alma-universe.vercel.app
**Demo Credentials:** `doctor@alma.health` / `alma2024`

---

## Project Status

### Current State: Frontend Complete, Backend Pending

The frontend is fully functional with demo data (localStorage). Next step is integrating Supabase for real backend/database/auth.

### Features Completed

| Feature | Status | Notes |
|---------|--------|-------|
| Login page | Done | Demo credentials only |
| Dashboard | Done | Stats, recent patients, hero image |
| Patient list | Done | Search, filter, sort |
| Add patient | Done | Form with validation |
| Edit patient | Done | Inline editing |
| Delete patient | Done | Confirmation modal |
| My Account page | Done | Profile editing with live preview |
| Security settings | Done | Password change with strength indicator |
| Responsive sidebar | Done | Collapsible with hover toggle |
| Toast notifications | Done | Success/error/info states |
| Unsaved changes warning | Done | Modal on navigation |

### What's NOT Real Yet (Pending Supabase)

- User registration (only hardcoded demo user)
- Real authentication (JWT/sessions)
- Database persistence (currently localStorage)
- Multi-user support (doctors seeing only their patients)
- Password hashing/security

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom design system
- **State**: React Context (AuthContext, PatientContext)
- **Storage**: localStorage (demo mode - to be replaced with Supabase)
- **Deployment**: Vercel
- **Backend (planned)**: Supabase (PostgreSQL + Auth + API)

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Public routes (login)
│   │   └── login/
│   ├── (dashboard)/       # Protected routes
│   │   ├── account/       # My Account page
│   │   ├── dashboard/     # Dashboard home
│   │   └── patients/      # Patient management
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Entry redirect
├── components/
│   ├── account/           # Profile components (PersonalInfoForm, SecurityForm, etc.)
│   ├── auth/              # ProtectedRoute wrapper
│   ├── layout/            # Header, Sidebar, MainLayout
│   ├── patients/          # Patient domain components
│   └── ui/                # Reusable primitives (Button, Input, Tabs, Modal, etc.)
├── context/
│   ├── AuthContext.tsx    # Auth state + login/logout/updateProfile
│   └── PatientContext.tsx # Patient CRUD operations
├── hooks/                 # useLocalStorage, useDebounce
├── lib/
│   ├── constants.ts       # App constants, demo data, dropdown options
│   ├── storage.ts         # localStorage helpers (to be replaced)
│   ├── utils.ts           # Utility functions (cn, formatDate, etc.)
│   └── validation.ts      # Form validation functions
└── types/
    └── index.ts           # TypeScript interfaces (Patient, Doctor, etc.)
```

---

## Key Data Models

### Doctor (Health Professional)
```typescript
interface Doctor {
  id: string;
  email: string;              // Read-only
  title?: string;             // Dr., Prof., Mr., Ms., etc.
  firstName: string;
  lastName: string;
  clinicName?: string;
  displayPreference?: 'professional' | 'clinic' | 'both';
  country?: string;
  language?: string;
  personalMobile?: PhoneNumber;
  officePhone?: PhoneNumber;
  personalWebsite?: string;
  questionnaireUrl?: string;  // Wellness assessment link suffix
  medicalLicenseNumber?: string;
  specialization?: string;
  bio?: string;
  education?: string;
  officeAddress?: Address;
}
```

### Patient
```typescript
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex?: 'female' | 'male' | 'other' | 'prefer-not-to-say';
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Essential Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npx vercel       # Deploy to Vercel
```

---

## Design System

**Colors:**
- `purple-*` - Primary brand color (buttons, links, accents)
- `stone-*` - Text and borders
- `success-*` - Green for success states
- `error-*` - Red for errors
- `warning-*` - Yellow/orange for warnings

**Typography:**
- Body: Inter (sans-serif)
- Clean, clinical aesthetic

---

## Roadmap

### Phase 1: Backend Integration (Next)
1. Create Supabase project (PostgreSQL + Auth)
2. Create database schema (doctors, patients tables)
3. Install `@supabase/supabase-js`
4. Update AuthContext → Supabase Auth
5. Update PatientContext → Supabase queries
6. Remove demo mode (localStorage, hardcoded credentials)

### Phase 2: Auth Enhancements
- Registration page
- Email verification
- Password reset flow
- OAuth providers (Google, etc.)

### Phase 3: Future Features (Ideas)
- Appointments/scheduling
- Medical records/history
- Document uploads
- Billing/invoicing
- Analytics dashboard
- Multi-language support

---

## Key Files Reference

| Purpose | Location |
|---------|----------|
| Type definitions | `src/types/index.ts` |
| App constants & demo data | `src/lib/constants.ts` |
| Form validation | `src/lib/validation.ts` |
| localStorage helpers | `src/lib/storage.ts` |
| Auth state & methods | `src/context/AuthContext.tsx` |
| Patient CRUD | `src/context/PatientContext.tsx` |
| Design tokens | `tailwind.config.ts` |
| Environment example | `.env.example` |

---

## Important Notes

- **Wellness Assessment Link**: The `questionnaireUrl` field creates a URL like `skinxs.com/diag/[suffix]` for patients to complete AI-powered wellness assessments before visits.

- **Display Preference**: Doctors can choose to appear as their professional name, clinic name, or both throughout the platform.

- **Row Level Security**: When Supabase is integrated, RLS will ensure doctors only see their own patients.

---

## Git Commit History (Recent)

```
c2e9042 Add My Account page with profile management
f750321 Refine dashboard and login page UI
e31b0b7 Redesign UI with premium clinical aesthetic
eac7cef Add project documentation for Claude Code
853c25a Initial commit
```
