# Architectural Patterns

Patterns and conventions used throughout the Alma Universe codebase.

## State Management: React Context Pattern

Global state uses React Context with a consistent structure:

1. **Interface for context value** - defines the shape of exposed state/functions
2. **Provider component** - wraps children with state logic
3. **Custom hook** - typed accessor with error boundary

```
Pattern: createContext → Provider component → useXxx hook
```

**References:**
- `src/context/AuthContext.tsx:8-12` - AuthContextValue interface
- `src/context/AuthContext.tsx:22-91` - AuthProvider implementation
- `src/context/AuthContext.tsx:93-99` - useAuth hook with error if outside provider
- `src/context/PatientContext.tsx:8-20` - PatientContextValue interface
- `src/context/PatientContext.tsx:195-201` - usePatients hook

**Convention:** Hooks throw descriptive errors when used outside their Provider.

## UI Components: Variant-Based Styling

UI primitives use variant maps for consistent styling:

1. **Type unions** define allowed variants: `type ButtonVariant = 'primary' | 'secondary' | ...`
2. **Style maps** associate variants with Tailwind classes: `Record<Variant, string>`
3. **cn() utility** merges conditional classes
4. **forwardRef** enables ref forwarding on form elements

**References:**
- `src/components/ui/Button.tsx:6-7` - ButtonVariant/ButtonSize types
- `src/components/ui/Button.tsx:18-50` - variantStyles map
- `src/components/ui/Button.tsx:58-127` - forwardRef pattern
- `src/lib/utils.ts:4-6` - cn() utility (clsx wrapper)

**Convention:** All form inputs (Input, Select, Textarea) use forwardRef and accept standard HTML attributes via spread.

## SSR-Safe Storage

localStorage access is guarded for server-side rendering:

```typescript
function isClient(): boolean {
  return typeof window !== 'undefined';
}
```

**References:**
- `src/lib/storage.ts:5-7` - isClient guard
- `src/lib/storage.ts:10-20` - getFromStorage with SSR check
- `src/hooks/useLocalStorage.ts:9-11` - mounted state for hydration safety

**Convention:** All localStorage operations return null/no-op when called server-side.

## Form Validation Pattern

Forms use a validation result object pattern:

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];  // { field: string, message: string }[]
}
```

**References:**
- `src/lib/validation.ts:7-11` - ValidationResult/ValidationError types
- `src/lib/validation.ts:35-77` - validatePatientForm implementation
- `src/lib/validation.ts:80-82` - getFieldError helper
- `src/components/patients/PatientForm.tsx:38-46` - Error state management, clear on change

**Convention:** Errors clear per-field as user types (not all at once).

## Route Protection

Authenticated routes use a wrapper component pattern:

1. **ProtectedRoute** checks auth state
2. Shows loading spinner during auth check
3. Redirects to `/login` if unauthenticated
4. Renders nothing during redirect to prevent flash

**References:**
- `src/components/auth/ProtectedRoute.tsx:12-37` - Full implementation
- `src/app/(dashboard)/layout.tsx:6-16` - Applied to dashboard route group

**Convention:** Use Next.js route groups `(auth)` and `(dashboard)` to separate public and protected layouts.

## Barrel Exports

Components organized by domain with index.ts re-exports:

```
src/components/ui/index.ts        → exports Button, Input, Card, etc.
src/components/layout/index.ts    → exports Header, Sidebar, MainLayout
src/components/patients/index.ts  → exports PatientForm, PatientCard, etc.
```

**Convention:** Import from domain path, not individual files:
```typescript
import { Button, Input, Card } from '@/components/ui';
```

## Type Organization

Types centralized in `src/types/index.ts`:

1. **Domain types** - represent entities (Patient, Doctor)
2. **FormData types** - subset for form input (PatientFormData)
3. **State types** - context state shape (AuthState)
4. **Utility types** - reusable helpers (SortDirection)

**References:**
- `src/types/index.ts:2-13` - Patient domain type
- `src/types/index.ts:15-23` - PatientFormData (form subset)
- `src/types/index.ts:33-37` - AuthState

**Convention:** FormData types omit computed fields (id, createdAt, updatedAt).

## Constants Organization

All magic values in `src/lib/constants.ts`:

- Storage keys (`STORAGE_KEYS`)
- Demo credentials (`DEMO_CREDENTIALS`)
- Seed data (`SEED_PATIENTS`)
- Form options (`SEX_OPTIONS`)

**Convention:** Use `as const` for readonly type inference.

## Component Data Flow

Patient CRUD operations flow through context:

```
Page → usePatients() → PatientContext → storage.ts → localStorage
```

**References:**
- `src/context/PatientContext.tsx:43-46` - updatePatients syncs to storage
- `src/context/PatientContext.tsx:109-129` - addPatient creates entity with timestamps
- `src/lib/storage.ts:58-65` - getPatients/setPatients

**Convention:** Context handles business logic; pages orchestrate UI flow.
