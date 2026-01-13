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
| Clinical Documentation | Done | 6-step flow: Patient → Health → Photos → Concerns → Treatments → Summary |
| Treatment Pricing | Done | Multi-currency, per-country defaults, doctor customization |

### Clinical Documentation Flow

The clinical documentation wizard guides physicians through a 6-step process:

1. **Patient Selection** - Select existing or create new patient record
2. **Health Background** - Two sections:
   - Clinical Medical History (cancer, medications, conditions) - never used by AI
   - Cosmetic Safety Profile (pregnancy, menopause, sensitivities) - for ingredient exclusion
3. **Photo Collection** - Capture frontal + profile photos with remove.bg background removal
4. **Skin Concerns** - Select from 17 medical skin conditions across 4 categories (drag & drop priority)
5. **Treatment Selection** - Select treatments from 4 categories with pricing:
   - **EBD Devices** - Alma device catalog with per-session pricing
   - **Toxins** - Custom doctor procedures (e.g., Botox, Dysport)
   - **Injectables** - Custom doctor procedures (e.g., Juvederm, Restylane)
   - **Other Aesthetic Procedures** - Custom procedures with subcategories
6. **Summary** - Review all documented information with treatment cards and totals
   - Option to enter **Skin Wellness Mode** (non-medical cosmetic analysis)
   - Regulatory boundary modal with SkinXS branding (sky blue theme)

Key files:
- `src/app/(dashboard)/clinical-documentation/new/page.tsx` - Main wizard page
- `src/components/clinical-documentation/` - Step components
- `src/lib/skinConcerns.ts` - Skin concern categories and items
- `src/lib/ebdDevices.ts` - EBD device catalog and database fetch
- `src/lib/doctorProcedures.ts` - Custom procedures CRUD
- `src/lib/treatmentCategories.ts` - Treatment category constants
- `src/lib/backgroundRemoval.ts` - remove.bg API integration
- `src/lib/pricing.ts` - Multi-currency pricing utilities
- `src/lib/medicalHistory.ts` - Health Background data functions
- `src/components/clinical-documentation/EnterSkinWellnessModal.tsx` - Regulatory boundary modal

### Skin Wellness Mode (SkinXS)

Non-medical cosmetic skin analysis feature, separate from clinical documentation:

- **Regulatory boundary**: Clear modal with disclosure text separating clinical from cosmetic
- **SkinXS branding**: Sky blue color palette, SkinXS logo
- **Data isolation**: Only uses photos and cosmetic preferences, NOT medical history
- **SaMD compliance**: Explicit disclaimers that it does not diagnose, treat, prevent, or manage medical conditions

#### Skin Wellness Flow (3 steps)

1. **Analysis** - Premium 10-second animated loading screen with:
   - Scanning beam that sweeps left-to-right, then right-to-left (category-colored)
   - Floating particles rising from bottom
   - Pulsing glow around photo
   - Progress ring around SkinXS logo
   - Background gradient shifts with current category color
   - Enhanced corner frames with colored accents
   - Category names cycle with "Observing {category}..." text

2. **Results** - Cosmetic Skin Appearance Overview with:
   - Flower/radial visualization (10 petals, one per skin category)
   - Interactive: tap segments to adjust visibility levels (0-4)
   - Patient info card with photo thumbnails
   - Patient attributes (editable): gender, eye color, Fitzpatrick type, skin thickness, skin type
   - Overview text (editable, regeneratable)
   - Image quality score modal

3. **Complete** - Navigation to skincare recommendations (future)

#### Skin Wellness Categories (10)

| Category | Color |
|----------|-------|
| Skin Radiance | Yellow (#FBBF24) |
| Surface Smoothness | Pink (#F472B6) |
| Visible Redness | Red (#EF4444) |
| Hydration Appearance | Blue (#3B82F6) |
| Shine Appearance | Orange (#F97316) |
| Skin Texture | Grey (#6B7280) |
| Visible Blemishes | Green (#22C55E) |
| Uneven Tone & Dark Spots | Brown (#92400E) |
| Eye Contour | Taupe (#78716C) |
| Skin Aging | Light Beige (#D6D3D1) |

Key files:
- `src/app/(dashboard)/skin-wellness/[photoSessionId]/page.tsx` - Main page
- `src/components/skin-wellness/SkinAnalysisLoading.tsx` - Analysis animation screen
- `src/components/skin-wellness/SkinWellnessResults.tsx` - Results overview
- `src/components/skin-wellness/FlowerVisualization.tsx` - Radial chart component
- `src/components/skin-wellness/SkinWellnessStepProgress.tsx` - 3-step progress indicator
- `src/components/skin-wellness/CategoryDetailModal.tsx` - Category detail popup
- `src/lib/skinWellnessCategories.ts` - Category definitions and colors
- `src/lib/mockSkinAnalysis.ts` - Mock data generator (v1)
- `src/components/clinical-documentation/EnterSkinWellnessModal.tsx` - Entry modal

Theme:
- Sky blue palette (`tailwind.config.ts` - `sky`)
- SkinXS logo at `/public/images/skinxs-logo.svg`

### Treatment Pricing System

Multi-currency pricing with country-specific defaults:

- **Price storage**: All prices stored in cents (integers) to avoid floating-point issues
- **Multi-currency**: USD ($), EUR (€), GBP (£), etc. based on doctor's country
- **Price hierarchy**: Doctor's custom price → Country default → Global default
- **Editable in Settings only**: Prices are read-only during clinical documentation

Database tables:
- `ebd_devices.default_price_cents` - Global default price per device
- `ebd_device_country_prices` - Country-specific default prices (device_id, country_code, price)
- `doctor_devices.price_cents` - Doctor's custom price (NULL = use default)
- `doctor_procedures.price_cents` - Required price for custom procedures

Migrations:
- `007_add_treatment_pricing.sql` - Adds price columns to existing tables
- `008_add_device_country_prices.sql` - Creates country-specific pricing table with seed data

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
│   ├── api/               # API routes (server-side)
│   │   └── remove-background/  # Background removal proxy
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
- `ebd_devices` - Master catalog of 19 Energy-Based Devices (with default_price_cents)
- `ebd_device_country_prices` - Country-specific default prices per device
- `doctor_devices` - Junction table: devices per doctor (with custom price_cents)
- `country_devices` - Junction table: which devices available per country
- `doctor_procedures` - Custom procedures per doctor (with price_cents)

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
REMOVE_BG_API_KEY=xxx  # Server-side only (for photo background removal)
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

## Compliance

**Status:** Pre-compliance - requires remediation before commercial deployment

### Compliance Documentation

| Document | Location |
|----------|----------|
| Unified Compliance Roadmap | `docs/compliance/COMPLIANCE_ROADMAP.md` |
| Compliance Tracker | `docs/compliance/COMPLIANCE_TRACKER.md` |

### Key Compliance Areas

| Area | Status | Priority Items |
|------|--------|----------------|
| **Security** | Partial | Next.js updated, API key secured, logging improved |
| **SaMD Avoidance** | Needs Work | Remove "AI-powered" language, rename "treats" field |
| **GDPR** | Non-Compliant | Privacy policy, data export, consent mechanisms |
| **HIPAA** | Non-Compliant | BAAs, audit logging, session timeout |
| **US State Laws** | Non-Compliant | Breach notification, state-specific requirements |

### Critical Blockers (P0)

1. Replace remove.bg with HIPAA-compliant solution
2. Sign BAA with Supabase (upgrade to Pro)
3. Create Privacy Policy and Terms of Service
4. Remove SaMD-triggering language ("AI-powered", "treats")

See `docs/compliance/COMPLIANCE_ROADMAP.md` for full details.

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
