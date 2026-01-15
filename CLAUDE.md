# Alma Universe

Clinical management web app for health professionals - premium patient CRUD with luxury medical aesthetic.

**Live URL:** https://alma-universe.vercel.app

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
   - Clinical Medical History (Fitzpatrick type, recovery preferences, cancer, medications, conditions) - never used by AI
   - Cosmetic Safety Profile (pregnancy, menopause, sensitivities) - for ingredient exclusion
3. **Photo Collection** - Capture frontal + profile photos with remove.bg background removal
   - **Skip to Skin Wellness**: Secondary button to bypass steps 4-6 and go directly to Skin Wellness Mode
   - When skipping, navigates directly (no modal) since doctor already chose cosmetic-only path
4. **Skin Concerns** - Select from 17 medical skin conditions across 4 categories (drag & drop priority)
5. **Treatment Selection** - Select treatments from 4 categories with pricing:
   - **EBD Devices** - Alma device catalog with compatibility-based organization
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
- `src/lib/deviceRecommendations.ts` - Device compatibility scoring based on patient profile
- `src/lib/doctorProcedures.ts` - Custom procedures CRUD
- `src/lib/treatmentCategories.ts` - Treatment category constants
- `src/lib/backgroundRemoval.ts` - remove.bg API integration
- `src/lib/pricing.ts` - Multi-currency pricing utilities
- `src/lib/medicalHistory.ts` - Health Background data functions
- `src/lib/clinicalSession.ts` - Clinical session CRUD and status tracking
- `src/components/clinical-documentation/EnterSkinWellnessModal.tsx` - Regulatory boundary modal

#### Clinical Session Management

Sessions are created at the START of clinical documentation and tracked through three phases:

**Session Status:** `draft` → `in_progress` → `completed` (or `abandoned`)

**Phase Statuses:**

| Phase | Status Values | When Updated |
|-------|--------------|--------------|
| Medical Documentation | `pending` → `in_progress` → `completed` | Steps 1-6 of wizard |
| Skin Wellness Analysis | `pending` → `in_progress` → `completed` (or `skipped`) | Skin Wellness Mode |
| Skincare Recommendations | `pending` → `in_progress` → `completed` | Future feature |

**Skip Scenarios:**
- Photos skipped → `analysis_status` = `skipped`, proceeds to skincare
- Concerns skipped → Still allows Skin Wellness (analysis uses photos only)

**Key Functions (`src/lib/clinicalSession.ts`):**
- `createClinicalSession()` - Called on page load
- `startSession()` - When patient selected (draft → in_progress)
- `skipPhotos()` / `savePhotosToSession()` - Photo step handlers
- `completeMedicalPhase()` - After summary step
- `startAnalysisPhase()` / `completeAnalysisPhase()` - Skin Wellness tracking
- `completeSkincarePhase()` - Marks session complete

**Database:** `clinical_evaluation_sessions` table with automatic `last_activity_at` updates via trigger.

#### EBD Device Recommendation System

EBD devices are organized based on patient profile compatibility using a scoring algorithm:

**Scoring Criteria (100 points total):**
- Skin concerns match (40 points) - Priority-weighted by concern order
- Fitzpatrick compatibility (30 points) - Device must support patient's skin type
- Recovery time match (30 points) - Device downtime within patient's preferences

**Priority-Weighted Concern Scoring:**
| Priority | Points | Notes |
|----------|--------|-------|
| #1 concern | 18 | Top priority concern |
| #2 concern | 12 | Second priority |
| #3+ concerns | 2 each | Max 10 points total for all remaining |

**Recommendation threshold:** Score >= 50% AND Fitzpatrick compatible AND downtime acceptable

**Recovery Time Mapping:**
| Patient Preference | Acceptable Downtimes |
|-------------------|---------------------|
| same-day | None only |
| 1-2-days | None, Minimal |
| 3-5-days | None, Minimal, Some |
| more-than-5-days | All |

UI shows "Recommended for This Patient" section (emerald styling) followed by "Other Available Devices" with warning badges for incompatible skin types or longer recovery.

### Skin Wellness Mode (SkinXS)

Non-medical cosmetic skin analysis feature, separate from clinical documentation:

- **Regulatory boundary**: Clear modal with disclosure text separating clinical from cosmetic
- **SkinXS branding**: Sky blue color palette, SkinXS logo
- **Data isolation**: Only uses photos and cosmetic preferences, NOT medical history
- **SaMD compliance**: Explicit disclaimers that it does not diagnose, treat, prevent, or manage medical conditions

#### Entry Points

| Entry Point | From Step | Modal Shown | Back Button Returns To |
|-------------|-----------|-------------|----------------------|
| "Enter Skin Wellness Mode" | Step 6 (Summary) | Yes (regulatory disclosure) | Step 6 (Summary) |
| "Skip to Skin Wellness Analysis" | Step 3 (Photos) | No (direct navigation) | Step 3 (Photos) |

When entering from Step 3, the doctor has explicitly chosen to skip clinical documentation, so no regulatory modal is needed.

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

#### Skin Parameter Scoring System

Each category has detailed sub-parameters that can be scored by doctors:

**Parameter Types:**
- **Severity scores** (1-4 or 1-5): Measure intensity of a condition (e.g., wrinkles, oiliness)
- **Conditional scores** (1-3): Answer "Is redness due to X?" questions (No redness / Not attributed / Confirmed cause)

**UI Features:**
- AI personalized text displayed at original AI-assigned score position (read-only)
- Standardized text options shown via radio buttons when editing
- Score badge with color coding (green → yellow → orange → red)
- Modal prevents closing when unsaved changes exist (Save/Cancel only)

**Auto-Scoring Logic (MAX-based):**
Category visibility score (0-10) calculated from parameter scores:
- Uses MAX of normalized parameter scores (worst parameter determines category)
- Normalized formula: `((score - 1) / (maxScore - 1)) * 10`

**Scoring Exceptions:**
| Rule | Parameters |
|------|------------|
| Excluded (not counted) | freckles, moles |
| Half weight (50%) | predictive_factors_hyperpigmentation, predictive_factors_dryness, predictive_factors_dehydration |
| Boosted (130%) | redness_present, couperose_present |
| Excluded | All conditional parameters (is_rosacea, is_sunburn, etc.) |

**Priority Skin Concerns:**
Results screen shows top 3 face concerns + Eye Contour + Neck & Décolleté based on scores.

**Tie-Breaking Order** (when scores are equal):
1. Redness (highest priority)
2. Blemishes
3. Tone
4. Texture
5. Smoothness
6. Hydration
7. Radiance
8. Shine (lowest priority)

Key files:
- `src/lib/skinParameterOptions.ts` - Standardized text options for all parameters, auto-scoring functions
- `src/lib/skinWellnessDetails.ts` - Parameter definitions and mock data
- `src/components/skin-wellness/CategoryDetailModal.tsx` - Parameter editing UI

#### Doctor Validation System

When doctors review AI analysis results, they can modify all values. The validated diagnostic is saved when clicking "Continue":

**What Gets Saved:**
- Category visibility scores (0-10)
- Parameter details per category
- Patient attributes (gender, eye color, Fitzpatrick, skin thickness, skin type)
- Overview text (editable)
- Priority skin concerns (up to 3 face + additional areas)

**Change Tracking:**
The `modifications` JSONB field tracks all doctor changes vs AI original values for future ML training:
- Score changes per category
- Parameter detail changes
- Attribute changes
- Overview text changed (boolean)
- Concerns manually edited (boolean)

**Upsert Logic:**
- One validation per photo session (UNIQUE constraint on `photo_session_id`)
- If doctor returns from skincare page and makes changes, previous validation is overwritten
- When returning from skincare page, saved values are restored (skips analysis animation)

Database table: `skin_analysis_validations`

Key files:
- `supabase/migrations/014_add_skin_analysis_validations.sql` - Database migration
- `src/lib/skinWellnessValidation.ts` - Save/load validation functions
- `src/app/(dashboard)/skin-wellness/[photoSessionId]/skincare/page.tsx` - Skincare selection page

#### Universkin Products (Skincare Selection)

The third step of Skin Wellness Mode allows doctors to recommend personalized skincare products:

**Product Categories:**
| Category | Products | Duration | Apply Time |
|----------|----------|----------|------------|
| Cleanse | Hydrating Oil Cleanser ($41), Clarifying Gel Cleanser ($52) | 60 days | AM&PM |
| Prep | Daily Radiance Pads ($85), Barrier Renewal Pads ($85) | 30-60 days | AM&PM / PM |
| Strengthen | Barrier Nourishing Crème Light/Rich ($68), Barrier Restoring Balm ($83), HA Boosting Serum ($80) | 30-60 days | AM&PM |
| Sunscreen | Daily Mineral Serum SPF50 ($75) | 90 days | AM |
| Kits | Recovery Kit ($78), Aging Skin Kit ($103), Pigment Control Kit ($76) | 30 days | AM&PM |
| **Treat** | *(Future: personalized serums)* | - | - |

**Database Architecture:**
- `universkin_products` - Master product catalog (12 products)
  - `duration_days` - How long product lasts (30, 60, 90 days)
  - `when_to_apply` - Application time ('AM', 'PM', 'AM&PM')
- `country_universkin_products` - Country availability (currently US only)
- `doctor_universkin_products` - Doctor price overrides (future)
- `universkin_product_country_prices` - Country-specific pricing (future)

**UI Design (matches Treatment Selection pattern):**
- Accordion-style category sections (expandable/collapsible)
- AI auto-recommends one product per category
- Product cards with:
  - 2:3 aspect ratio product images (clickable for lightbox preview)
  - Quantity selector (Qty)
  - Application time selector (AM/PM/AM&PM icons)
  - Duration badge (days)
  - Price display
- Total card shows estimated cost + shortest routine duration
- Premium serum bottle icon in header (sky blue gradient)

**Application Time Icons:**
- Sun icon = AM (Morning)
- Moon icon = PM (Evening)
- Sun + Moon = AM&PM (Morning & Evening)

Key files:
- `src/app/(dashboard)/skin-wellness/[photoSessionId]/skincare/page.tsx` - Main page
- `src/components/skincare/SkincareCategorySection.tsx` - Accordion category section
- `src/components/skincare/SelectedProductCard.tsx` - Selected product with controls
- `src/components/skincare/ProductSelectionModal.tsx` - Add product modal
- `src/components/ui/ImageLightbox.tsx` - Full-screen image preview
- `src/lib/universkinProducts.ts` - Product data, utilities, duration calculation
- `src/types/index.ts` - `WhenToApply` type, `UniverskinProduct`, `SelectedUniverskinProduct`
- `supabase/migrations/015_add_universkin_products.sql` - Base tables migration
- `supabase/migrations/016_add_universkin_duration_and_apply_time.sql` - Duration/apply time columns
- `supabase/seed-universkin-products.sql` - Product seed data with all fields

#### SkinXS Diagnostic API Integration

Real AI-powered skin analysis via the SkinXS API:

**API Details:**
- **Endpoint:** `POST https://website-skinxs-api-lzetymrodq-uc.a.run.app/analyze_images/`
- **Timeout:** Up to 45 seconds (Vercel function `maxDuration: 120`)
- **Rate Limit:** 1000 requests per doctor per month

**Inputs:**
- `frontal_image` (required) - Patient frontal photo
- `left_side_image` (optional) - Left profile photo
- `right_side_image` (optional) - Right profile photo
- `language` - Default: `en`
- `main_skin_concern` - Left empty (not using doctor's selected concerns)

**Background Processing Flow:**
1. Doctor clicks "Continue" after Photo Collection step
2. Photos saved to Supabase Storage
3. Background API call triggered (fire-and-forget)
4. Analysis runs in background while doctor continues workflow
5. Results ready when entering Skin Wellness Mode

**Database Tables:**
- `skin_analysis_results` - Stores raw API response + parsed fields (scores, patient attributes, image quality)
- `api_usage_logs` - Tracks monthly API usage per doctor for rate limiting

**Category Color Mapping (API → Our System):**
| API Key | Category ID | Display Name |
|---------|-------------|--------------|
| yellow | radiance | Skin Radiance |
| pink | smoothness | Surface Smoothness |
| red | redness | Visible Redness |
| blue | hydration | Hydration Appearance |
| orange | shine | Shine Appearance |
| grey | texture | Skin Texture |
| green | blemishes | Visible Blemishes |
| brown | tone | Uneven Tone & Dark Spots |
| eye | eye-contour | Eye Contour |
| neck | neck-decollete | Neck & Décolleté |

**Environment Variables (Server-side only):**
```bash
SKINXS_API_KEY=<api-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  # Required for server-side DB access
```

**Key Files:**
- `src/app/api/skin-analysis/route.ts` - API route (POST triggers analysis, GET fetches results)
- `src/lib/skinAnalysis.ts` - Service functions (rate limiting, photo session, DB operations)
- `src/lib/skinAnalysisMapping.ts` - API response → our data structure mapping
- `supabase/migrations/011_add_skin_analysis.sql` - Database tables for results and usage logs

**Fallback Behavior:**
If real analysis unavailable (pending/failed), the app falls back to mock data generation.

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
- `010_add_fitzpatrick_and_recovery_time.sql` - Adds Fitzpatrick skin type and recovery time preferences to patient_medical_history

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
- `patient_medical_history` - Health background (Fitzpatrick type, recovery preferences, cancer history, cosmetic safety profile)
- `photo_sessions` - Patient photo sessions (frontal, left, right profiles)
- `clinical_evaluation_sessions` - Clinical documentation sessions
- `ebd_devices` - Master catalog of 19 Energy-Based Devices (with default_price_cents)
- `ebd_device_country_prices` - Country-specific default prices per device
- `doctor_devices` - Junction table: devices per doctor (with custom price_cents)
- `country_devices` - Junction table: which devices available per country
- `doctor_procedures` - Custom procedures per doctor (with price_cents)
- `universkin_products` - Master skincare product catalog (12 products)
- `country_universkin_products` - Country availability for skincare products
- `doctor_universkin_products` - Doctor price overrides for skincare products

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
