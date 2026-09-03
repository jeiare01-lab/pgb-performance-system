# PGB Performance Management System 

Real-time performance tracking, appraisal management, KPI monitoring, and PIP escalation for Primary Group of Builders.

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Vercel or GitHub Pages for deployment

### 1. Setup Supabase

1. Create a new Supabase project at https://supabase.com
2. Copy your Project URL and Anon Key from Settings > API
3. In SQL Editor, run the schema from `src/lib/supabase.js` (the `SQL_SCHEMA` export)
   - Copy everything from `CREATE TABLE IF NOT EXISTS user_profiles` through to the seed data
   - Paste into SQL Editor and run

### 2. Environment Setup

Create `.env.local` in project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features

### For Supervisors
- **Appraisal Form**: Enter KPIs (50%), Competencies (30%), and Values (20%) ratings
- **KPI Tracking**: Log weekly/monthly progress on company Rocks (Cash, Succession, Productivity, Partnerships)
- **PIP Management**: Initiate Performance Improvement Plans with automated escalation (Week 2→8)

### For HR
- **Dashboard**: System-wide appraisal completion, PIP status, KPI health
- **Promotion Eligibility**: Flag employees with 2+ appraisals ≥3 rating
- **PIP Escalation Alerts**: Monitor which PIPs are at Final Warning or Pre-termination
- **IDP Tracking**: View succession pipeline by level (High Potential, Critical Role Backups, Emerging Leaders)

### For Executives
- **Executive Dashboard**: Completion rates, PIP success indicators, succession pipeline health
- **Read-Only Access**: View all data without editing capability

## Integration Points

### Career Lattice Link
- Each employee has a `career_path_stage` field
- IDPs link to Career Lattice framework via `career_lattice_stage`

### EOS Rocks Alignment
- KPI catalog maps to 4 company Rocks:
  - Stronger Cash Position
  - Succession Plan in Place
  - Productivity & Process Efficiencies
  - Stronger Partnerships & Joint Venture

### Performance Appraisal Form (PDF)
- Mirrors your revised FY 2026 form exactly
- KPI: 50% weight, Competencies: 30%, Values: 20%
- Weighted score auto-calculates

## Database Schema

Key tables:
- `employees` - PGB employee directory
- `appraisals` - Performance appraisal submissions
- `employee_kpis` - KPI targets per appraisal period
- `kpi_tracking` - Weekly/monthly KPI progress logs
- `pips` - Performance Improvement Plans
- `pip_tracking` - Weekly check-ins with escalation tracking
- `idps` - Individual Development Plans for succession
- `promotion_records` - Eligibility and recommendation tracking
- `audit_log` - Compliance tracking

## Deployment to Vercel

1. Push to GitHub (create `jeiare01-lab/pgb-performance-system` repo)
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy (automatic on push)

## Key Workflows

### Completing an Appraisal
1. Navigate to **Appraisal** tab
2. Select employee and period
3. Rate KPIs, Competencies, and Values
4. Overall score auto-calculates (weighted)
5. Save → status changes to "submitted"

### Tracking KPIs In-Season
1. **KPI Tracking** tab
2. Select employee and period
3. Log weekly/monthly actuals
4. System calculates progress % automatically
5. Status indicators: On Target (100%), On Track (80%+), At Risk (60%+), Critical (<60%)

### Initiating a PIP
1. **Performance Improvement** tab
2. Click "+ New PIP"
3. Fill reason, performance objectives
4. PIP runs for 8 weeks with escalation:
   - Week 2: Written Warning
   - Week 4: Final Warning
   - Week 6: Pre-termination
   - Week 8: Termination
5. Log weekly check-ins (on track / off track)

### Succession Planning
1. **IDP & Succession** tab shows pipeline by tier
2. HR/executives see Individual Development Plans
3. Link to appraisal competency gaps
4. Track mentor/coach assignments and quarterly reviews

## Access Control

- **Supervisors**: Can create/submit appraisals for direct reports, log KPI tracking, initiate PIPs
- **HR**: Full visibility across system, can edit PIPs, manage promotions and IDPs
- **Executives**: Read-only dashboard, summary metrics

## Known Limitations

- Manual employee/KPI setup (bulk import script recommended for live data)
- Signature workflows are digital (checkboxes), not eSignature
- PIP escalation automation is rule-based (Week 2 = Written Warning, etc.)—can be customized per policy
- Quarterly IDP reviews are manually scheduled; no automatic reminders yet

## Support Notes for James

1. **Admin Load**: This system handles the transactional work (appraisal tracking, PIP escalation, eligibility flagging) so you can focus on strategy and succession narrative.

2. **Data Gaps**: The system needs initial population:
   - Employee directory (can sync from HRIS if available)
   - Career Lattice stages per employee
   - KPI assignments for current period
   - Career path competency requirements

3. **Pushback**: Your current PIP policy (8-week escalation) is solid. The form-based appraisal system will speed submission, but watch for supervisors skipping the "evidence" field—make that required in practice.

4. **Next Build**: Consider adding a bulk import tool for annual KPI assignments and a report builder for Paulette (CHRO) on succession readiness.

## Questions?

Check Supabase docs for schema updates, or reference the component code for feature details.

Last updated: Sept 3, 2026 7:58 AM!
