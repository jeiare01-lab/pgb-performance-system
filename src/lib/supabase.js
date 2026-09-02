import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// SUPABASE SCHEMA & INITIALIZATION GUIDE
// ============================================================================
// Run these SQL scripts in your Supabase dashboard (SQL Editor):

export const SQL_SCHEMA = `
-- USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'supervisor', -- supervisor, hr, executive
  sbu TEXT, -- Strategic Business Unit
  department TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- EMPLOYEES (PGB Employee Directory)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  position TEXT,
  sbu TEXT NOT NULL,
  department TEXT,
  supervisor_id UUID REFERENCES employees(id),
  hire_date DATE,
  status TEXT DEFAULT 'active', -- active, probation, inactive
  career_path_stage TEXT, -- linked to Career Lattice
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- KPI TARGETS (aligned to company Rocks)
CREATE TABLE IF NOT EXISTS kpi_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  rock_category TEXT NOT NULL, -- Stronger Cash Position, Succession Plan, Productivity & Process, Stronger Partnerships
  measurement_unit TEXT, -- %, $, days, count, etc.
  data_type TEXT DEFAULT 'numeric', -- numeric, boolean, text
  created_at TIMESTAMP DEFAULT NOW()
);

-- EMPLOYEE KPI ASSIGNMENTS (per appraisal period)
CREATE TABLE IF NOT EXISTS employee_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  kpi_id UUID NOT NULL REFERENCES kpi_catalog(id),
  appraisal_period TEXT NOT NULL, -- e.g., 'FY2026_H1', 'FY2026_H2'
  target_value DECIMAL(10, 2),
  weight_percent INT DEFAULT 50, -- typically 50% for KPIs
  tracking_frequency TEXT DEFAULT 'monthly', -- weekly, monthly, quarterly
  baseline_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, kpi_id, appraisal_period)
);

-- KPI TRACKING (weekly/monthly updates during the year)
CREATE TABLE IF NOT EXISTS kpi_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_kpi_id UUID NOT NULL REFERENCES employee_kpis(id),
  tracking_date DATE NOT NULL,
  actual_value DECIMAL(10, 2),
  progress_percent DECIMAL(5, 2), -- 0-100
  supervisor_notes TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_kpi_id, tracking_date)
);

-- COMPETENCIES (from Performance Appraisal Form)
CREATE TABLE IF NOT EXISTS competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  behavioral_examples TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PGB VALUES (Personal Attributes from form)
CREATE TABLE IF NOT EXISTS pgb_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  filipinized_name TEXT, -- e.g., Pagsalig
  english_name TEXT,
  description TEXT,
  behavioral_indicators TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- APPRAISALS (Performance Appraisal Form submissions)
CREATE TABLE IF NOT EXISTS appraisals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  appraisal_period TEXT NOT NULL, -- e.g., 'FY2026_H1'
  supervisor_id UUID REFERENCES employees(id),
  reviewer_id UUID REFERENCES user_profiles(id),
  status TEXT DEFAULT 'draft', -- draft, submitted, reviewed, signed
  kpi_weight DECIMAL(3, 2) DEFAULT 0.5,
  competency_weight DECIMAL(3, 2) DEFAULT 0.3,
  value_weight DECIMAL(3, 2) DEFAULT 0.2,
  overall_rating DECIMAL(2, 1),
  kpi_rating DECIMAL(2, 1),
  competency_rating DECIMAL(2, 1),
  value_rating DECIMAL(2, 1),
  comments TEXT,
  signed_by_employee_at TIMESTAMP,
  signed_by_supervisor_at TIMESTAMP,
  signed_by_reviewer_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, appraisal_period)
);

-- APPRAISAL KPI DETAILS (ratings for individual KPIs)
CREATE TABLE IF NOT EXISTS appraisal_kpi_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appraisal_id UUID NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  kpi_id UUID NOT NULL REFERENCES kpi_catalog(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  evidence TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- APPRAISAL COMPETENCY RATINGS
CREATE TABLE IF NOT EXISTS appraisal_competency_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appraisal_id UUID NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  observed_behavior TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- APPRAISAL VALUE RATINGS
CREATE TABLE IF NOT EXISTS appraisal_value_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appraisal_id UUID NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  value_id UUID NOT NULL REFERENCES pgb_values(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  example_evidence TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PERFORMANCE IMPROVEMENT PLANS
CREATE TABLE IF NOT EXISTS pips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  initiated_by_id UUID NOT NULL REFERENCES user_profiles(id),
  appraisal_id UUID REFERENCES appraisals(id),
  reason_text TEXT NOT NULL,
  performance_objectives TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active', -- active, completed, escalated, terminated
  current_week INT DEFAULT 1,
  current_sanction TEXT, -- Written Warning, Final Warning, Pre-termination, Termination
  support_provided TEXT,
  check_in_frequency TEXT DEFAULT 'weekly',
  signed_by_employee_at TIMESTAMP,
  signed_by_supervisor_at TIMESTAMP,
  signed_by_manager_at TIMESTAMP,
  signed_by_hr_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- PIP TRACKING (weekly progress)
CREATE TABLE IF NOT EXISTS pip_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pip_id UUID NOT NULL REFERENCES pips(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  check_in_date DATE NOT NULL,
  performance_status TEXT, -- on_track, off_track, exceeding
  supervisor_notes TEXT,
  goals_met BOOLEAN,
  escalation_status TEXT, -- none, written_warning, final_warning, pre_termination
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pip_id, week_number)
);

-- PROMOTION ELIGIBILITY TRACKING
CREATE TABLE IF NOT EXISTS promotion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  target_position TEXT NOT NULL,
  target_sbu TEXT,
  eligibility_status TEXT DEFAULT 'not_eligible', -- not_eligible, eligible, recommended, approved
  last_two_appraisals_avg DECIMAL(2, 1),
  required_competencies_met BOOLEAN,
  required_training_completed BOOLEAN,
  national_certificates TEXT,
  motivation_statement TEXT,
  recommended_by_id UUID REFERENCES user_profiles(id),
  approved_by_id UUID REFERENCES user_profiles(id),
  effective_date DATE,
  new_job_grade TEXT,
  salary_adjustment_amount DECIMAL(10, 2),
  submitted_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INDIVIDUAL DEVELOPMENT PLANS (for succession planning)
CREATE TABLE IF NOT EXISTS idps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  succession_level TEXT, -- high_potential, critical_role_backup, emerging_leader
  target_position TEXT,
  target_timeline_years INT,
  key_competency_gaps TEXT,
  development_activities TEXT, -- JSON array of activities, timelines, owners
  career_lattice_stage TEXT, -- linked to Career Lattice
  mentor_id UUID REFERENCES employees(id),
  coach_assigned_id UUID REFERENCES user_profiles(id),
  status TEXT DEFAULT 'active', -- active, completed, paused
  quarterly_review_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AUDIT LOG (for compliance and tracking)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  changed_by_id UUID REFERENCES user_profiles(id),
  changes_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX idx_employees_sbu ON employees(sbu);
CREATE INDEX idx_employees_supervisor ON employees(supervisor_id);
CREATE INDEX idx_appraisals_employee_period ON appraisals(employee_id, appraisal_period);
CREATE INDEX idx_kpi_tracking_date ON kpi_tracking(tracking_date);
CREATE INDEX idx_pips_status ON pips(status);
CREATE INDEX idx_pips_employee ON pips(employee_id);

-- SEED DATA: PGB Company Rocks KPIs
INSERT INTO kpi_catalog (code, name, description, rock_category, measurement_unit, data_type) VALUES
  ('CASH_COLLECTIONS', 'Collections & Liquidity Targets', 'Monthly collections, working capital management', 'Stronger Cash Position', '%', 'numeric'),
  ('CASH_REDUCTION', 'Cost Reduction & Efficiency', 'Cost-to-output savings', 'Stronger Cash Position', '%', 'numeric'),
  ('SUCCESSION_PROGRESS', 'Succession Plan Development', 'Identified successors & readiness tiers', 'Succession Plan in Place', 'count', 'numeric'),
  ('DEVELOPMENT_COMPLETION', 'IDP Milestone Completion', 'Development activities completed', 'Succession Plan in Place', '%', 'numeric'),
  ('CYCLE_TIME', 'Process Cycle Time Reduction', 'Days to process/deliver', 'Productivity & Process Efficiencies', 'days', 'numeric'),
  ('YIELD_IMPROVEMENT', 'Operational Yield & Quality', 'Yield percentage, defect rate', 'Productivity & Process Efficiencies', '%', 'numeric'),
  ('PARTNERSHIP_SCORE', 'Strategic Partner Scorecards', 'Partner satisfaction & collaboration', 'Stronger Partnership & Joint Venture', 'score', 'numeric'),
  ('JV_PERFORMANCE', 'Joint Venture Returns', 'JV profitability & KPI attainment', 'Stronger Partnership & Joint Venture', '%', 'numeric');

-- SEED DATA: Competencies (from Performance Appraisal Form)
INSERT INTO competencies (code, name, description, behavioral_examples) VALUES
  ('JOB_KNOWLEDGE', 'Job Knowledge', 'Depth of expertise and understanding of role responsibilities', 'Demonstrates technical proficiency; stays current with best practices; trains others'),
  ('DECISION_MAKING', 'Decision Making / Problem Solving', 'Ability to analyze and solve complex problems', 'Gathers relevant data; considers alternatives; makes timely, sound decisions'),
  ('COMMUNICATION', 'Communication', 'Clarity in verbal and written expression; active listening', 'Communicates clearly; listens actively; adapts message to audience'),
  ('PLANNING', 'Planning & Organizing', 'Ability to structure work and manage resources', 'Sets priorities; manages time; coordinates across teams'),
  ('LEADERSHIP', 'Leadership', 'Ability to influence, develop, and inspire others', 'Provides clear direction; develops team members; demonstrates initiative'),
  ('CUSTOMER_FOCUS', 'Customer Focus', 'Commitment to meeting internal and external customer needs', 'Anticipates customer needs; responds promptly; seeks feedback');

-- SEED DATA: PGB Values (from Performance Appraisal Form)
INSERT INTO pgb_values (code, filipinized_name, english_name, description, behavioral_indicators) VALUES
  ('PAGSALIG', 'Pagsalig', 'Built on Trust', 'Integrity, reliability, and keeping commitments', 'Honest in dealings; follows through on promises; maintains confidentiality'),
  ('PAGKUGI', 'Pagkugi', 'We Keep Going', 'Initiative, energy, and resilience under pressure', 'Shows proactive approach; persists through challenges; maintains positive attitude'),
  ('HINIUSANG_PAGTUTOK', 'Hiniusang Pagtutok', 'We Get Things Done Together', 'Teamwork, collaboration, and shared focus on goals', 'Contributes to team success; seeks input; supports colleagues'),
  ('PAGPALAMBO', 'Pagpalambo', 'We Strive to Make Things Better', 'Innovation, learning, and continuous improvement', 'Suggests improvements; learns from mistakes; embraces change');
`;

export async function initializeSchema() {
  // This function should be run once to set up the database
  // Users should run the SQL_SCHEMA manually in Supabase SQL Editor
  console.log('Database schema initialization guide available in SQL_SCHEMA');
}
