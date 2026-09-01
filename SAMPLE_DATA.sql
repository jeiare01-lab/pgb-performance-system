-- PGB Performance Management System — Sample Data for Testing
-- Run this AFTER running the main schema from src/lib/supabase.js

-- ============================================================================
-- SAMPLE EMPLOYEES (Construction & Manufacturing, Real Estate, Maritime, HCD)
-- ============================================================================

INSERT INTO employees (employee_id, full_name, email, position, sbu, department, hire_date, status)
VALUES
  ('CM-001', 'Maria Santos', 'maria.santos@pgb.ph', 'Operations Manager', 'Construction & Manufacturing', 'AAC', '2019-03-15', 'active'),
  ('CM-002', 'Juan Reyes', 'juan.reyes@pgb.ph', 'Site Engineer', 'Construction & Manufacturing', 'CSI', '2020-06-01', 'active'),
  ('CM-003', 'Rosa Gonzales', 'rosa.gonzales@pgb.ph', 'Production Supervisor', 'Construction & Manufacturing', 'PSC', '2018-12-10', 'active'),
  ('RE-001', 'Carlos Villanueva', 'carlos.v@pgb.ph', 'Property Manager', 'Real Estate', 'PHI', '2017-01-20', 'active'),
  ('RE-002', 'Angela Cruz', 'angela.c@pgb.ph', 'Portfolio Analyst', 'Real Estate', 'PPC', '2021-09-05', 'active'),
  ('MAR-001', 'Roberto Lopez', 'roberto.l@pgb.ph', 'Port Operations Manager', 'Maritime', 'AMICI', '2019-08-22', 'active'),
  ('MAR-002', 'Grace Fernandez', 'grace.f@pgb.ph', 'Logistics Coordinator', 'Maritime', 'AMICI', '2020-11-30', 'active'),
  ('HCD-001', 'Miguel Torres', 'miguel.t@pgb.ph', 'Training Specialist', 'Human Capital Development', 'SEAMAN', '2021-02-14', 'active'),
  ('HCD-002', 'Patricia Aquino', 'patricia.a@pgb.ph', 'Skills Development Manager', 'Human Capital Development', 'SKILLS', '2019-05-18', 'active');

-- ============================================================================
-- SAMPLE KPI ASSIGNMENTS (for FY2026_H2)
-- ============================================================================

-- Maria Santos (CM-001) - KPIs
INSERT INTO employee_kpis (employee_id, kpi_id, appraisal_period, target_value, weight_percent, tracking_frequency, baseline_date)
SELECT 
  e.id, 
  k.id, 
  'FY2026_H2',
  CASE k.code
    WHEN 'CASH_COLLECTIONS' THEN 95
    WHEN 'YIELD_IMPROVEMENT' THEN 92
    WHEN 'CYCLE_TIME' THEN 15
  END,
  50,
  'monthly',
  '2026-07-01'
FROM employees e, kpi_catalog k
WHERE e.employee_id = 'CM-001' AND k.code IN ('CASH_COLLECTIONS', 'YIELD_IMPROVEMENT', 'CYCLE_TIME');

-- Juan Reyes (CM-002) - KPIs
INSERT INTO employee_kpis (employee_id, kpi_id, appraisal_period, target_value, weight_percent, tracking_frequency, baseline_date)
SELECT 
  e.id, 
  k.id, 
  'FY2026_H2',
  CASE k.code
    WHEN 'YIELD_IMPROVEMENT' THEN 88
    WHEN 'CYCLE_TIME' THEN 18
    WHEN 'SUCCESSION_PROGRESS' THEN 1
  END,
  50,
  'monthly',
  '2026-07-01'
FROM employees e, kpi_catalog k
WHERE e.employee_id = 'CM-002' AND k.code IN ('YIELD_IMPROVEMENT', 'CYCLE_TIME', 'SUCCESSION_PROGRESS');

-- Carlos Villanueva (RE-001) - KPIs
INSERT INTO employee_kpis (employee_id, kpi_id, appraisal_period, target_value, weight_percent, tracking_frequency, baseline_date)
SELECT 
  e.id, 
  k.id, 
  'FY2026_H2',
  CASE k.code
    WHEN 'CASH_COLLECTIONS' THEN 98
    WHEN 'PARTNERSHIP_SCORE' THEN 85
    WHEN 'DEVELOPMENT_COMPLETION' THEN 80
  END,
  50,
  'monthly',
  '2026-07-01'
FROM employees e, kpi_catalog k
WHERE e.employee_id = 'RE-001' AND k.code IN ('CASH_COLLECTIONS', 'PARTNERSHIP_SCORE', 'DEVELOPMENT_COMPLETION');

-- Roberto Lopez (MAR-001) - KPIs
INSERT INTO employee_kpis (employee_id, kpi_id, appraisal_period, target_value, weight_percent, tracking_frequency, baseline_date)
SELECT 
  e.id, 
  k.id, 
  'FY2026_H2',
  CASE k.code
    WHEN 'CYCLE_TIME' THEN 2
    WHEN 'JV_PERFORMANCE' THEN 102
    WHEN 'SUCCESSION_PROGRESS' THEN 2
  END,
  50,
  'weekly',
  '2026-07-01'
FROM employees e, kpi_catalog k
WHERE e.employee_id = 'MAR-001' AND k.code IN ('CYCLE_TIME', 'JV_PERFORMANCE', 'SUCCESSION_PROGRESS');

-- ============================================================================
-- SAMPLE APPRAISALS (submitted, ready to view)
-- ============================================================================

INSERT INTO appraisals (employee_id, appraisal_period, status, kpi_rating, competency_rating, value_rating, overall_rating, comments)
SELECT 
  e.id, 
  'FY2026_H2',
  'submitted',
  4,
  3.5,
  4,
  (4 * 0.5 + 3.5 * 0.3 + 4 * 0.2)
FROM employees e WHERE e.employee_id = 'CM-001';

INSERT INTO appraisals (employee_id, appraisal_period, status, kpi_rating, competency_rating, value_rating, overall_rating, comments)
SELECT 
  e.id, 
  'FY2026_H2',
  'submitted',
  3,
  3,
  3,
  (3 * 0.5 + 3 * 0.3 + 3 * 0.2)
FROM employees e WHERE e.employee_id = 'CM-002';

INSERT INTO appraisals (employee_id, appraisal_period, status, kpi_rating, competency_rating, value_rating, overall_rating, comments)
SELECT 
  e.id, 
  'FY2026_H2',
  'submitted',
  5,
  4,
  4.5,
  (5 * 0.5 + 4 * 0.3 + 4.5 * 0.2)
FROM employees e WHERE e.employee_id = 'RE-001';

-- ============================================================================
-- SAMPLE KPI TRACKING (actual values logged over time)
-- ============================================================================

-- Maria Santos progress tracking
INSERT INTO kpi_tracking (employee_kpi_id, tracking_date, actual_value, progress_percent, supervisor_notes)
SELECT 
  ek.id,
  '2026-07-31',
  85,
  (85 / ek.target_value * 100)
FROM employee_kpis ek
JOIN kpi_catalog k ON ek.kpi_id = k.id
WHERE ek.employee_id = (SELECT id FROM employees WHERE employee_id = 'CM-001')
  AND k.code = 'CASH_COLLECTIONS' AND ek.appraisal_period = 'FY2026_H2';

INSERT INTO kpi_tracking (employee_kpi_id, tracking_date, actual_value, progress_percent, supervisor_notes)
SELECT 
  ek.id,
  '2026-08-31',
  90,
  (90 / ek.target_value * 100)
FROM employee_kpis ek
JOIN kpi_catalog k ON ek.kpi_id = k.id
WHERE ek.employee_id = (SELECT id FROM employees WHERE employee_id = 'CM-001')
  AND k.code = 'CASH_COLLECTIONS' AND ek.appraisal_period = 'FY2026_H2';

-- Roberto Lopez (Maritime) — good progress
INSERT INTO kpi_tracking (employee_kpi_id, tracking_date, actual_value, progress_percent, supervisor_notes)
SELECT 
  ek.id,
  '2026-07-15',
  1.8,
  (1.8 / ek.target_value * 100)
FROM employee_kpis ek
JOIN kpi_catalog k ON ek.kpi_id = k.id
WHERE ek.employee_id = (SELECT id FROM employees WHERE employee_id = 'MAR-001')
  AND k.code = 'CYCLE_TIME' AND ek.appraisal_period = 'FY2026_H2';

INSERT INTO kpi_tracking (employee_kpi_id, tracking_date, actual_value, progress_percent, supervisor_notes)
SELECT 
  ek.id,
  '2026-08-15',
  1.9,
  (1.9 / ek.target_value * 100)
FROM employee_kpis ek
JOIN kpi_catalog k ON ek.kpi_id = k.id
WHERE ek.employee_id = (SELECT id FROM employees WHERE employee_id = 'MAR-001')
  AND k.code = 'CYCLE_TIME' AND ek.appraisal_period = 'FY2026_H2';

-- ============================================================================
-- SAMPLE IDPS (Succession Pipeline)
-- ============================================================================

INSERT INTO idps (employee_id, succession_level, target_position, target_timeline_years, key_competency_gaps, status, career_lattice_stage)
SELECT 
  e.id,
  'high_potential',
  'Regional Operations Director',
  2,
  'Strategic Planning, Executive Communication',
  'active',
  'Level 5'
FROM employees e WHERE e.employee_id = 'CM-001';

INSERT INTO idps (employee_id, succession_level, target_position, target_timeline_years, key_competency_gaps, status, career_lattice_stage)
SELECT 
  e.id,
  'emerging_leader',
  'Area Manager',
  3,
  'Project Management, Team Leadership',
  'active',
  'Level 3'
FROM employees e WHERE e.employee_id = 'CM-002';

INSERT INTO idps (employee_id, succession_level, target_position, target_timeline_years, key_competency_gaps, status, career_lattice_stage)
SELECT 
  e.id,
  'critical_role_backup',
  'Regional Portfolio Manager',
  1,
  'None - Ready',
  'active',
  'Level 4'
FROM employees e WHERE e.employee_id = 'RE-001';

-- ============================================================================
-- NOTES
-- ============================================================================
-- This sample data creates:
-- - 9 sample employees across 4 SBUs
-- - KPI assignments for 4 employees (FY2026_H2)
-- - 3 submitted appraisals (ratings varying 3-5)
-- - KPI tracking data over 2 months
-- - 3 IDPs for succession pipeline
--
-- Use this to test:
-- 1. Dashboard metrics
-- 2. Appraisal form viewing
-- 3. KPI tracker progress visualization
-- 4. Promotion eligibility (Carlos is eligible)
-- 5. Succession pipeline
--
-- After testing, you can delete this data and load production employee data.
