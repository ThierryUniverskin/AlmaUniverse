# Alma Universe - Unified Compliance Roadmap

**Document Version:** 1.0
**Created:** 2026-01-11
**Last Updated:** 2026-01-11
**Status:** Draft - Pending Implementation

---

## Executive Summary

This roadmap consolidates findings from five compliance audits:
1. **Security Audit** - Technical vulnerabilities
2. **SaMD Audit** - Medical device regulation avoidance
3. **GDPR Audit** - EU data protection
4. **HIPAA Audit** - US healthcare privacy
5. **Additional Legal Requirements** - State laws, accessibility, etc.

**Current Compliance Status:**

| Domain | Status | Blocker Level |
|--------|--------|---------------|
| Security | Partial | Medium |
| SaMD Avoidance | Partial | High |
| GDPR | Non-Compliant | Critical |
| HIPAA | Non-Compliant | Critical |
| US State Laws | Non-Compliant | High |
| Accessibility | Unknown | Medium |

---

## Priority Levels

| Level | Definition | Timeline Target |
|-------|------------|-----------------|
| **P0 - Blocker** | Cannot launch without fixing; legal/regulatory blocker | Immediate |
| **P1 - Critical** | Significant legal risk; must fix before commercial use | Before Launch |
| **P2 - High** | Important compliance gap; should fix soon after launch | Within 30 days |
| **P3 - Medium** | Best practice; reduces risk | Within 90 days |
| **P4 - Low** | Enhancement; nice to have | Future |

---

## Phase 1: Pre-Launch Blockers (P0)

### 1.1 Third-Party Vendor Compliance

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P0-001 | **remove.bg not HIPAA/GDPR compliant** | HIPAA, GDPR | Replace with HIPAA-compliant image processing OR self-host solution | High | Engineering |
| P0-002 | **No BAA with Supabase** | HIPAA | Upgrade to Supabase Pro, sign BAA | Low | Admin |
| P0-003 | **No DPA with remove.bg** | GDPR | If keeping, obtain DPA; otherwise, see P0-001 | Low | Legal |
| P0-004 | **Verify EU-US data transfer mechanism** | GDPR | Confirm Supabase DPF certification or implement SCCs | Low | Legal |

### 1.2 Privacy Policy & Legal Notices

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P0-005 | **No Privacy Policy (links point to #)** | GDPR, CCPA | Create comprehensive privacy policies (Doctor + Patient) | Medium | Legal |
| P0-006 | **No Terms of Service** | General | Create Terms of Service | Medium | Legal |
| P0-007 | **Privacy policy links broken** | GDPR | `login/page.tsx:247-249`, `Sidebar.tsx:11-12` - Update href | Low | Engineering |

### 1.3 SaMD Avoidance (Regulatory)

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P0-008 | **"AI-powered" language** | SaMD | Remove from `PersonalInfoForm.tsx:175`, `ProfileSidebar.tsx:88` | Low | Engineering |
| P0-009 | **"treats" field implies treatment recommendation** | SaMD | Rename to `applications` or `commonUses` throughout codebase | Medium | Engineering |
| P0-010 | **Photo consent "analysis" language** | SaMD | Update `PhotoConsentSection.tsx:147,153` - remove "analyzed", "recommendations" | Low | Engineering |

---

## Phase 2: Critical Pre-Launch (P1)

### 2.1 Authentication & Session Security

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P1-001 | **No automatic session timeout** | HIPAA, Security | Implement 15-min idle timeout with 2-min warning | Medium | Engineering |
| P1-002 | **Strengthen password requirements** | HIPAA, Security | Add special char, password history, optional expiration | Low | Engineering |

### 2.2 Audit & Logging

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P1-003 | **No PHI access audit trail** | HIPAA | Create `audit_logs` table; log all PHI access/modifications | High | Engineering |
| P1-004 | **No login/logout logging** | HIPAA, Security | Log authentication events with timestamps | Medium | Engineering |

### 2.3 Data Subject Rights

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P1-005 | **No data export (portability)** | GDPR | Add patient data export (JSON/CSV) | Medium | Engineering |
| P1-006 | **Incomplete deletion (photos in storage)** | GDPR, HIPAA | Ensure Supabase Storage photos deleted on patient delete | Low | Engineering |
| P1-007 | **No consent withdrawal mechanism** | GDPR | Add UI for consent management/withdrawal | Medium | Engineering |

### 2.4 Breach Notification

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P1-008 | **No breach detection system** | HIPAA, GDPR, State Laws | Implement breach detection mechanisms | High | Engineering |
| P1-009 | **No breach notification workflow** | HIPAA, GDPR, State Laws | Create notification tracking (60 days HIPAA, 72 hrs GDPR) | Medium | Engineering |

### 2.5 Consent Improvements

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P1-010 | **Bundled Terms + Privacy consent** | GDPR | Separate Terms and Privacy Policy consent | Low | Engineering |
| P1-011 | **No cookie/storage notice** | GDPR, ePrivacy | Add storage notice explaining localStorage use | Low | Engineering |

---

## Phase 3: Post-Launch High Priority (P2)

### 3.1 Administrative Safeguards (Documentation)

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P2-001 | **No Security Risk Assessment** | HIPAA | Conduct and document formal risk analysis | Medium | Security |
| P2-002 | **No Contingency/DR Plan** | HIPAA | Document backup, disaster recovery, emergency procedures | Medium | Operations |
| P2-003 | **No Security Policies** | HIPAA | Create required policy documents (see Appendix A) | Medium | Legal/Security |
| P2-004 | **No Incident Response Plan** | HIPAA, Security | Document security incident procedures | Medium | Security |

### 3.2 Enhanced Access Controls

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P2-005 | **No emergency access procedure** | HIPAA | Implement break-glass access with logging | Medium | Engineering |
| P2-006 | **No role-based access** | HIPAA | Consider adding roles (physician, nurse, admin) | High | Engineering |
| P2-007 | **No accounting of disclosures** | HIPAA | Log all PHI disclosures for patient requests | Medium | Engineering |

### 3.3 Accessibility

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P2-008 | **No accessibility audit completed** | ADA, EU Directive | Conduct WCAG 2.1 AA audit | Medium | QA |
| P2-009 | **Fix accessibility issues** | ADA, EU Directive | Remediate findings from audit | Medium-High | Engineering |

### 3.4 Data Retention

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P2-010 | **No retention policy** | GDPR, HIPAA, State Laws | Implement configurable retention (default: 20 years) | Medium | Engineering |
| P2-011 | **No automated retention enforcement** | GDPR | Add retention period tracking and alerts | Medium | Engineering |

---

## Phase 4: Medium Priority Enhancements (P3)

### 4.1 Additional SaMD Safeguards

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P3-001 | **Add Fitzpatrick disclaimer** | SaMD | Add "reference only, physician-determined" to device displays | Low | Engineering |
| P3-002 | **Add skin concerns header disclaimer** | SaMD | Add "Physician-selected observations" header | Low | Engineering |
| P3-003 | **Add regulatory disclaimer to footer** | SaMD | "Not a medical device" notice | Low | Engineering |

### 4.2 Enhanced Security

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P3-004 | **Add MFA support** | Security, Best Practice | Implement optional two-factor authentication | Medium | Engineering |
| P3-005 | **Add session device management** | Security | Show active sessions, allow remote logout | Medium | Engineering |
| P3-006 | **Add login attempt throttling** | Security | Rate limit failed login attempts | Low | Engineering |

### 4.3 State-Specific Compliance

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P3-007 | **California CMIA authorization** | CA Law | Review if written authorization (vs consent) needed | Low | Legal |
| P3-008 | **Washington MHMDA compliance** | WA Law | Implement specific consent for health data | Low | Legal |

### 4.4 Internationalization

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P3-009 | **Multi-language privacy notices** | GDPR | Translate privacy policy for EU markets | Medium | Legal |

### 4.5 France-Specific (If Targeting French Market)

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P3-010 | **Supabase not HDS certified** | French Law | Use HDS-certified provider (AWS/Azure/Scalingo) for French patient data OR exclude France | High | Engineering/Legal |

---

## Phase 5: Future Enhancements (P4)

### 5.1 Certifications

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P4-001 | **SOC 2 Type II certification** | Enterprise Sales | Plan and execute SOC 2 audit | High | Security |
| P4-002 | **HITRUST certification** | US Healthcare Sales | Consider for enterprise healthcare | High | Security |
| P4-003 | **ISO 27001 certification** | EU Enterprise Sales | Consider for EU market | High | Security |

### 5.2 Advanced Features

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P4-004 | **Patient portal** | Best Practice | Allow patients to access their data | High | Product |
| P4-005 | **Advanced consent management** | GDPR | Granular consent preferences per purpose | Medium | Engineering |
| P4-006 | **DPIA documentation tool** | GDPR | Built-in Data Protection Impact Assessment | Medium | Engineering |

### 5.3 Minor Handling

| ID | Issue | Source | Action | Effort | Owner |
|----|-------|--------|--------|--------|-------|
| P4-007 | **Implement parental consent** | COPPA, GDPR | Special flow for patients under 16/13 | Medium | Engineering |
| P4-008 | **Age verification** | COPPA, GDPR | Verify age at patient creation | Low | Engineering |

---

## Appendix A: Required Policy Documents

For HIPAA Administrative Safeguards, create these policies:

| # | Policy | Priority |
|---|--------|----------|
| 1 | Security Management Process Policy | P2 |
| 2 | Workforce Security Policy | P2 |
| 3 | Information Access Management Policy | P2 |
| 4 | Security Awareness and Training Policy | P2 |
| 5 | Security Incident Procedures | P2 |
| 6 | Contingency Plan (Backup/DR) | P2 |
| 7 | Workstation Use Policy | P3 |
| 8 | Device and Media Controls Policy | P3 |
| 9 | Access Control Policy | P2 |
| 10 | Audit Controls Policy | P2 |
| 11 | Integrity Policy | P3 |
| 12 | Transmission Security Policy | P3 |
| 13 | Business Associate Policy | P1 |
| 14 | Breach Notification Policy | P1 |
| 15 | Privacy Policy (Public) | P0 |

---

## Appendix B: Third-Party Vendor Status

| Vendor | Service | PHI Exposure | BAA/DPA Status | Action |
|--------|---------|--------------|----------------|--------|
| **Supabase** | Database, Auth, Storage | All PHI | Needs BAA (Pro tier); **NOT HDS certified (France blocker)** | Upgrade + Sign BAA; For France: use HDS-certified alternative |
| **remove.bg** | Photo processing | Facial photos | Not HIPAA compliant | Replace |
| **Vercel** | Hosting | None (code only) | N/A | None |
| **Google Fonts** | Font CDN | IP only | N/A | None |

---

## Appendix C: Data Retention Requirements Summary

| Jurisdiction | Retention Period | Notes |
|--------------|------------------|-------|
| HIPAA | 6 years | For covered documentation |
| California | 7 years (adult) / age 19 (minor) | Whichever longer |
| New York | 6 years | From last treatment |
| Texas | 7 years (adult) / age 21 (minor) | |
| Germany | 10-30 years | Depends on record type |
| France | 20 years | |
| GDPR General | As long as necessary | Document justification |

**Recommendation:** Default to 20 years with configurable per-jurisdiction settings.

---

## Appendix D: Compliance Checklist by Market

### US-Only Deployment

- [ ] P0-001 to P0-004: Vendor compliance
- [ ] P0-005, P0-006: Privacy policy and ToS
- [ ] P1-001 to P1-004: Session security and audit logging
- [ ] P1-008, P1-009: Breach notification
- [ ] P2-001 to P2-004: Administrative safeguards
- [ ] P2-008, P2-009: Accessibility (ADA)

### EU-Only Deployment

- [ ] P0-003, P0-004: DPAs and data transfer
- [ ] P0-005, P0-006: Privacy policy and ToS
- [ ] P0-008 to P0-010: SaMD language fixes
- [ ] P1-005 to P1-007: Data subject rights
- [ ] P1-010, P1-011: Consent improvements
- [ ] P2-008, P2-009: Accessibility (EU Directive)
- [ ] P3-009, P3-010: Internationalization

### Both US + EU Deployment

- [ ] All items from both checklists
- [ ] P0-004: EU-US data transfer mechanisms (critical)
- [ ] P2-010, P2-011: Longest retention period (20 years)
- [ ] Dual breach notification compliance

---

## Appendix E: Quick Reference - Files to Modify

### P0 Engineering Tasks

| Task ID | Files to Modify |
|---------|-----------------|
| P0-001 | `src/app/api/remove-background/route.ts`, `src/lib/backgroundRemoval.ts` |
| P0-007 | `src/app/(auth)/login/page.tsx`, `src/components/layout/Sidebar.tsx` |
| P0-008 | `src/components/account/PersonalInfoForm.tsx`, `src/components/account/ProfileSidebar.tsx` |
| P0-009 | `src/types/index.ts`, `src/lib/ebdDevices.ts`, multiple component files |
| P0-010 | `src/components/clinical-documentation/PhotoConsentSection.tsx` |

### P1 Engineering Tasks

| Task ID | Files to Modify |
|---------|-----------------|
| P1-001 | `src/context/AuthContext.tsx`, `src/components/auth/ProtectedRoute.tsx` |
| P1-002 | `src/lib/validation.ts` |
| P1-003 | New: `src/lib/auditLog.ts`, `supabase/migrations/xxx_add_audit_logs.sql` |
| P1-005 | New: `src/app/api/export/route.ts` or similar |
| P1-006 | `src/context/PatientContext.tsx` (delete patient function) |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-11 | Claude | Initial consolidated roadmap |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | | | |
| Legal/Compliance | | | |
| Product Owner | | | |
| Security Officer | | | |
