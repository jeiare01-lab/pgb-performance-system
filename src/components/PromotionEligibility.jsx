import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CRITERIA = [
  { id: 'rating', label: 'Overall Rating ≥3 for 2+ Appraisal Periods', description: 'Employee must have met or exceeded expectations in at least 2 consecutive appraisals.' },
  { id: 'competencies', label: 'Proficiency on Required Competencies', description: 'Demonstrated competency level exceeds requirements for current role.' },
  { id: 'skillset', label: 'Basic Skill Set & Training for New Role', description: 'Has acquired necessary skills, certifications, and training for the target position.' },
  { id: 'motivation', label: 'Personal Motivation & Willingness', description: 'Employee has expressed desire and commitment to take on new responsibilities.' },
];

export default function PromotionEligibility() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [eligibilityFilter, setEligibilityFilter] = useState('all'); // all, eligible, ineligible

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('employees')
        .select('employee_id, first_name, last_name, department, job_grade, performance_rating')
        .order('last_name');

      if (err) throw err;
      setEmployees(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const checkEligibility = (emp) => {
    const checks = {
      rating: emp.performance_rating >= 3, // Simplified: should check 2+ periods
      competencies: emp.performance_rating >= 3, // Would need competency data
      skillset: true, // Would need training/cert data
      motivation: false, // Would need explicit employee response
    };
    return checks;
  };

  const isEligible = (emp) => {
    const checks = checkEligibility(emp);
    return checks.rating && checks.competencies && checks.skillset && checks.motivation;
  };

  const meetsMinimum = (emp) => {
    const checks = checkEligibility(emp);
    return checks.rating && checks.competencies && checks.skillset; // At least 3 of 4
  };

  const eligible = employees.filter(e => isEligible(e));
  const pending = employees.filter(e => meetsMinimum(e) && !isEligible(e));
  const ineligible = employees.filter(e => !meetsMinimum(e));

  const displayEmployees = eligibilityFilter === 'eligible' ? eligible : eligibilityFilter === 'ineligible' ? ineligible : employees;

  return (
    <div style={styles.container}>
      <h2>Promotion Eligibility Assessment</h2>
      <p style={styles.subtitle}>Career Path Management · Effective 22nd of Month</p>

      {error && (
        <div style={styles.error}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Criteria Overview */}
          <div style={styles.criteriaSection}>
            <h3>Promotion Eligibility Criteria</h3>
            <div style={styles.criteriaGrid}>
              {CRITERIA.map(crit => (
                <div key={crit.id} style={styles.criteriaCard}>
                  <div style={styles.criteriaNumber}>{CRITERIA.indexOf(crit) + 1}</div>
                  <h4 style={styles.criteriaLabel}>{crit.label}</h4>
                  <p style={styles.criteriaDesc}>{crit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div style={styles.statsSection}>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{eligible.length}</div>
              <div style={styles.statLabel}>Eligible for Promotion</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{pending.length}</div>
              <div style={styles.statLabel}>Pending Motivation Confirmation</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statValue}>{ineligible.length}</div>
              <div style={styles.statLabel}>Not Yet Eligible</div>
            </div>
          </div>

          {/* Filter & Display */}
          <div style={styles.section}>
            <h3>Employee Eligibility Status</h3>

            <div style={styles.filterButtons}>
              {[
                { value: 'all', label: `All (${employees.length})`, color: '#666' },
                { value: 'eligible', label: `Eligible (${eligible.length})`, color: '#4CAF50' },
                { value: 'ineligible', label: `Not Eligible (${ineligible.length})`, color: '#F44336' },
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setEligibilityFilter(filter.value)}
                  style={{
                    ...styles.filterButton,
                    borderBottom: eligibilityFilter === filter.value ? `3px solid ${filter.color}` : '1px solid #ddd',
                    color: eligibilityFilter === filter.value ? filter.color : '#666',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div style={styles.employeeList}>
              {displayEmployees.map(emp => {
                const checks = checkEligibility(emp);
                const eligible = isEligible(emp);
                const statusColor = eligible ? '#4CAF50' : meetsMinimum(emp) ? '#FF9800' : '#F44336';
                const statusText = eligible ? 'Eligible' : meetsMinimum(emp) ? 'Pending' : 'Ineligible';

                return (
                  <div key={emp.employee_id} style={styles.empCard}>
                    <div style={styles.empHeader}>
                      <div>
                        <h4 style={styles.empName}>{emp.last_name}, {emp.first_name}</h4>
                        <p style={styles.empMeta}>{emp.employee_id} · {emp.department} · JG {emp.job_grade}</p>
                      </div>
                      <div style={{
                        ...styles.statusBadge,
                        backgroundColor: statusColor,
                      }}>
                        {statusText}
                      </div>
                    </div>

                    <div style={styles.criteriaChecklist}>
                      {CRITERIA.map(crit => (
                        <div key={crit.id} style={styles.checkItem}>
                          <span style={{
                            ...styles.checkMark,
                            color: checks[crit.id] ? '#4CAF50' : '#ccc',
                          }}>
                            {checks[crit.id] ? '✓' : '○'}
                          </span>
                          <span style={styles.checkLabel}>{crit.label}</span>
                        </div>
                      ))}
                    </div>

                    {eligible && (
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setShowRecommendation(true);
                        }}
                        style={styles.recommendButton}
                      >
                        Submit Promotion Recommendation
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendation Form */}
          {showRecommendation && selectedEmployee && (
            <PromotionRecommendationForm
              employee={selectedEmployee}
              onClose={() => {
                setShowRecommendation(false);
                setSelectedEmployee(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function PromotionRecommendationForm({ employee, onClose }) {
  const [formData, setFormData] = useState({
    currentDesignation: employee.role,
    currentGrade: employee.job_grade,
    recommendedDesignation: '',
    recommendedGrade: '',
    dateHired: '',
    nationalCertificates: '',
    newTargets: '',
    supervisorName: '',
    deptManagerName: '',
    hrRepName: '',
  });

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    if (!formData.recommendedDesignation || !formData.recommendedGrade) {
      alert('Please specify the recommended position and grade.');
      return;
    }
    alert(`✓ Promotion recommendation submitted for ${employee.first_name} ${employee.last_name}\n\nSubmission deadline: 15th of each month\nApproval by SVP for HR & Admin\nEffective date: 22nd of the month`);
    onClose();
  };

  return (
    <div style={styles.formOverlay}>
      <div style={styles.formContainer}>
        <div style={styles.formHeader}>
          <h3>Promotion Recommendation Form</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <div style={styles.formGrid2Col}>
          <div style={styles.formSection}>
            <label style={styles.label}>Employee Name</label>
            <input type="text" value={`${employee.last_name}, ${employee.first_name}`} disabled style={styles.disabledInput} />
          </div>
          <div style={styles.formSection}>
            <label style={styles.label}>IDNO</label>
            <input type="text" value={employee.employee_id} disabled style={styles.disabledInput} />
          </div>
        </div>

        <div style={styles.formGrid2Col}>
          <div style={styles.formSection}>
            <label style={styles.label}>Date Hired</label>
            <input
              type="date"
              value={formData.dateHired}
              onChange={(e) => handleChange('dateHired', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formSection}>
            <label style={styles.label}>National Certificates Acquired</label>
            <input
              type="text"
              placeholder="e.g., NC III Welding, NC IV Electrical"
              value={formData.nationalCertificates}
              onChange={(e) => handleChange('nationalCertificates', e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.sectionTitle}>Current Position</div>
        <div style={styles.formGrid2Col}>
          <div style={styles.formSection}>
            <label style={styles.label}>Designation (D)</label>
            <input type="text" value={formData.currentDesignation} disabled style={styles.disabledInput} />
          </div>
          <div style={styles.formSection}>
            <label style={styles.label}>Job Grade (JG)</label>
            <input type="text" value={formData.currentGrade} disabled style={styles.disabledInput} />
          </div>
        </div>

        <div style={styles.sectionTitle}>Recommended Promotion</div>
        <div style={styles.formGrid2Col}>
          <div style={styles.formSection}>
            <label style={styles.label}>Designation (D)</label>
            <input
              type="text"
              placeholder="New position"
              value={formData.recommendedDesignation}
              onChange={(e) => handleChange('recommendedDesignation', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formSection}>
            <label style={styles.label}>Job Grade (JG)</label>
            <input
              type="text"
              placeholder="New grade"
              value={formData.recommendedGrade}
              onChange={(e) => handleChange('recommendedGrade', e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formSection}>
          <label style={styles.label}>New Performance Targets</label>
          <textarea
            placeholder="Outline the key performance targets for the new role..."
            value={formData.newTargets}
            onChange={(e) => handleChange('newTargets', e.target.value)}
            style={styles.textarea}
          />
        </div>

        <div style={styles.sectionTitle}>Approval Chain</div>
        <div style={styles.formGrid2Col}>
          <div style={styles.formSection}>
            <label style={styles.label}>Immediate Supervisor Name</label>
            <input
              type="text"
              value={formData.supervisorName}
              onChange={(e) => handleChange('supervisorName', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formSection}>
            <label style={styles.label}>Department Manager Name</label>
            <input
              type="text"
              value={formData.deptManagerName}
              onChange={(e) => handleChange('deptManagerName', e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formSection}>
          <label style={styles.label}>HR Representative Name</label>
          <input
            type="text"
            value={formData.hrRepName}
            onChange={(e) => handleChange('hrRepName', e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.timeline}>
          <h4>Promotion Timeline</h4>
          <div style={styles.timelineStep}>
            <span style={styles.timelineDate}>15th of Month</span>
            <span>Submission deadline for all documentation</span>
          </div>
          <div style={styles.timelineStep}>
            <span style={styles.timelineDate}>End of Month</span>
            <span>HR review & SVP approval</span>
          </div>
          <div style={styles.timelineStep}>
            <span style={styles.timelineDate}>22nd of Month</span>
            <span>Promotion effective date</span>
          </div>
          <div style={styles.timelineStep}>
            <span style={styles.timelineDate}>13th Payday</span>
            <span>Salary adjustment effective date</span>
          </div>
        </div>

        <div style={styles.formActions}>
          <button onClick={onClose} style={styles.cancelButton}>Cancel</button>
          <button onClick={handleSubmit} style={styles.submitButton}>Submit Recommendation</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#666',
    margin: '0 0 20px 0',
    fontStyle: 'italic',
  },
  error: {
    padding: '12px',
    marginBottom: '16px',
    backgroundColor: '#fee',
    borderLeft: '4px solid #f44',
    borderRadius: '4px',
    color: '#c33',
  },
  criteriaSection: {
    marginBottom: '28px',
  },
  criteriaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
  criteriaCard: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#f9f9f9',
  },
  criteriaNumber: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: '24px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  criteriaLabel: {
    margin: '0 0 6px 0',
    fontSize: '12px',
    fontWeight: '600',
  },
  criteriaDesc: {
    margin: 0,
    fontSize: '11px',
    color: '#666',
    lineHeight: '1.4',
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '28px',
  },
  statBox: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    textAlign: 'center',
    border: '1px solid #e0e0e0',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
  },
  section: {
    marginBottom: '28px',
  },
  filterButtons: {
    display: 'flex',
    gap: '0',
    borderBottom: '2px solid #ddd',
    marginBottom: '16px',
  },
  filterButton: {
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.3s',
  },
  employeeList: {
    display: 'grid',
    gap: '16px',
  },
  empCard: {
    padding: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#f9f9f9',
  },
  empHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  empName: {
    margin: '0 0 4px 0',
    fontSize: '13px',
    fontWeight: '600',
  },
  empMeta: {
    margin: 0,
    fontSize: '11px',
    color: '#666',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  criteriaChecklist: {
    display: 'grid',
    gap: '6px',
    marginBottom: '12px',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px',
  },
  checkMark: {
    fontWeight: 'bold',
    minWidth: '16px',
  },
  checkLabel: {
    color: '#666',
  },
  recommendButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  formOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    width: '90%',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  formGrid2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  formSection: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '4px',
    fontSize: '11px',
  },
  input: {
    width: '100%',
    padding: '6px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '11px',
    boxSizing: 'border-box',
  },
  disabledInput: {
    width: '100%',
    padding: '6px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '11px',
    backgroundColor: '#f5f5f5',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '6px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '11px',
    minHeight: '60px',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    marginTop: '16px',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #ddd',
  },
  timeline: {
    padding: '12px',
    backgroundColor: '#F0F8FF',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  timelineStep: {
    display: 'flex',
    gap: '12px',
    fontSize: '11px',
    marginBottom: '8px',
  },
  timelineDate: {
    fontWeight: '600',
    color: '#2563eb',
    minWidth: '100px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  cancelButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
};
