import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PIP_STAGES = [
  { week: 2, stage: 'Written Warning', color: '#FF9800' },
  { week: 4, stage: 'Final Warning', color: '#F44336' },
  { week: 6, stage: 'Pre-termination', color: '#D32F2F' },
  { week: 8, stage: 'Termination', color: '#B71C1C' },
];

export default function PIPManagement() {
  const [employees, setEmployees] = useState([]);
  const [pips, setPips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showNewPIP, setShowNewPIP] = useState(false);
  const [pipFilter, setPipFilter] = useState('active'); // active, completed, all

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('employee_id, first_name, last_name, department, job_grade, performance_rating')
        .order('last_name');

      if (empError) throw empError;
      setEmployees(empData || []);

      // For now, initialize empty PIPs (would load from a PIPs table in real implementation)
      setPips([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCreatePIP = (emp) => {
    setSelectedEmployee(emp);
    setShowNewPIP(true);
  };

  const handleSavePIP = (pipData) => {
    const newPIP = {
      id: Date.now(),
      ...pipData,
      startDate: new Date(),
      status: 'active',
      currentWeek: 0,
      weeklyReviews: [],
    };
    setPips([...pips, newPIP]);
    setSelectedEmployee(null);
    setShowNewPIP(false);
  };

  const activePIPs = pips.filter(p => p.status === 'active');
  const completedPIPs = pips.filter(p => p.status !== 'active');

  const displayPIPs = pipFilter === 'active' ? activePIPs : pipFilter === 'completed' ? completedPIPs : pips;

  return (
    <div style={styles.container}>
      <h2>Performance Improvement Plan (PIP) Management</h2>
      <p style={styles.subtitle}>8-Week Consequence Management Period</p>

      {error && (
        <div style={styles.error}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* New PIP Section */}
          {!showNewPIP && (
            <div style={styles.section}>
              <h3>Initiate New PIP</h3>
              <div style={styles.employeeGrid}>
                {employees.map(emp => {
                  const hasPIP = activePIPs.some(p => p.employeeId === emp.employee_id);
                  return (
                    <button
                      key={emp.employee_id}
                      onClick={() => handleCreatePIP(emp)}
                      disabled={hasPIP}
                      style={{
                        ...styles.employeeCard,
                        opacity: hasPIP ? 0.5 : 1,
                        cursor: hasPIP ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <div style={styles.empName}>{emp.last_name}, {emp.first_name}</div>
                      <div style={styles.empId}>{emp.employee_id}</div>
                      <div style={styles.empDept}>{emp.department}</div>
                      {hasPIP && <div style={styles.badgeActive}>PIP Active</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* New PIP Form */}
          {showNewPIP && selectedEmployee && (
            <PIPForm
              employee={selectedEmployee}
              onSave={handleSavePIP}
              onCancel={() => {
                setShowNewPIP(false);
                setSelectedEmployee(null);
              }}
            />
          )}

          {/* PIP Status Section */}
          {!showNewPIP && (
            <div style={styles.section}>
              <h3>PIP Status</h3>

              <div style={styles.filterButtons}>
                {['active', 'completed', 'all'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setPipFilter(filter)}
                    style={{
                      ...styles.filterButton,
                      backgroundColor: pipFilter === filter ? '#2563eb' : '#f0f0f0',
                      color: pipFilter === filter ? '#fff' : '#333',
                    }}
                  >
                    {filter === 'active' ? `Active (${activePIPs.length})` : filter === 'completed' ? `Completed (${completedPIPs.length})` : `All (${pips.length})`}
                  </button>
                ))}
              </div>

              {displayPIPs.length === 0 ? (
                <p style={styles.empty}>No PIPs to display.</p>
              ) : (
                <div style={styles.pipList}>
                  {displayPIPs.map(pip => (
                    <PIPCard key={pip.id} pip={pip} employee={employees.find(e => e.employee_id === pip.employeeId)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PIPForm({ employee, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    employeeId: employee.employee_id,
    employeeName: `${employee.first_name} ${employee.last_name}`,
    issueStatement: '',
    performanceObjectives: '',
    support: {
      training: false,
      coaching: false,
      periodicMeetings: false,
      other: '',
    },
    supervisorName: '',
    deptManagerName: '',
    hrRepName: '',
    employeeComments: '',
  });

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSupportChange = (support, checked) => {
    setFormData({
      ...formData,
      support: {
        ...formData.support,
        [support]: checked,
      },
    });
  };

  const handleSubmit = () => {
    if (!formData.issueStatement || !formData.performanceObjectives) {
      alert('Please fill in Issue Statement and Performance Objectives.');
      return;
    }
    onSave(formData);
  };

  return (
    <div style={styles.pipFormContainer}>
      <div style={styles.pipFormHeader}>
        <h3>Create Performance Improvement Plan</h3>
        <button onClick={onCancel} style={styles.closeButton}>×</button>
      </div>

      <div style={styles.formSection}>
        <label style={styles.label}>Employee Name</label>
        <input type="text" value={formData.employeeName} disabled style={styles.disabledInput} />
      </div>

      <div style={styles.formSection}>
        <label style={styles.label}>Issue Statement</label>
        <textarea
          placeholder="Describe performance deficiencies with concrete examples..."
          value={formData.issueStatement}
          onChange={(e) => handleChange('issueStatement', e.target.value)}
          style={styles.textarea}
        />
      </div>

      <div style={styles.formSection}>
        <label style={styles.label}>Performance Objectives (Expected Standards)</label>
        <textarea
          placeholder="Specify what the employee must achieve to meet acceptable performance..."
          value={formData.performanceObjectives}
          onChange={(e) => handleChange('performanceObjectives', e.target.value)}
          style={styles.textarea}
        />
      </div>

      <div style={styles.formSection}>
        <label style={styles.label}>Support Provided During PIP Period</label>
        <div style={styles.checkboxGroup}>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.support.training}
              onChange={(e) => handleSupportChange('training', e.target.checked)}
            />
            Training
          </label>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.support.coaching}
              onChange={(e) => handleSupportChange('coaching', e.target.checked)}
            />
            Coaching
          </label>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.support.periodicMeetings}
              onChange={(e) => handleSupportChange('periodicMeetings', e.target.checked)}
            />
            Periodic Meetings (Weekly)
          </label>
        </div>
        <input
          type="text"
          placeholder="Other support (if any)"
          value={formData.support.other}
          onChange={(e) => handleChange('support', { ...formData.support, other: e.target.value })}
          style={{ ...styles.input, marginTop: '8px' }}
        />
      </div>

      <div style={styles.formGrid}>
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

      <div style={styles.formSection}>
        <label style={styles.label}>Employee Comments / Hesitations</label>
        <textarea
          placeholder="(Optional) Record any employee response or concerns..."
          value={formData.employeeComments}
          onChange={(e) => handleChange('employeeComments', e.target.value)}
          style={styles.textarea}
        />
      </div>

      <div style={styles.pipWarning}>
        <strong>⚠️ PIP Period: 8 Weeks</strong>
        <p>Failure to meet objectives may result in further disciplinary action up to and including termination.</p>
      </div>

      <div style={styles.formActions}>
        <button onClick={onCancel} style={styles.cancelButton}>Cancel</button>
        <button onClick={handleSubmit} style={styles.submitButton}>Create PIP</button>
      </div>
    </div>
  );
}

function PIPCard({ pip, employee }) {
  if (!employee) return null;

  const daysElapsed = Math.floor((new Date() - pip.startDate) / (1000 * 60 * 60 * 24));
  const weeksElapsed = Math.floor(daysElapsed / 7);
  const currentStage = PIP_STAGES.find(s => weeksElapsed >= s.week) || { week: 0, stage: 'Week 1 (Coaching)', color: '#2196F3' };

  const progressPercent = Math.min((weeksElapsed / 8) * 100, 100);

  return (
    <div style={styles.pipCard}>
      <div style={styles.pipCardHeader}>
        <div>
          <h4 style={styles.pipEmpName}>{employee.last_name}, {employee.first_name}</h4>
          <p style={styles.pipEmpId}>{employee.employee_id}</p>
        </div>
        <div style={{
          ...styles.stageBadge,
          backgroundColor: currentStage.color,
        }}>
          {currentStage.stage}
        </div>
      </div>

      <div style={styles.pipProgress}>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progressPercent}%`,
              backgroundColor: currentStage.color,
            }}
          />
        </div>
        <p style={styles.progressText}>Week {weeksElapsed}/8 ({daysElapsed} days elapsed)</p>
      </div>

      <div style={styles.pipDetails}>
        <p><strong>Started:</strong> {pip.startDate.toLocaleDateString()}</p>
        <p><strong>Issue:</strong> {pip.issueStatement.substring(0, 100)}...</p>
        <p><strong>Support:</strong> {Object.keys(pip.support).filter(k => pip.support[k]).join(', ')}</p>
      </div>

      <div style={styles.pipActions}>
        <button style={styles.actionButton}>Weekly Check-in</button>
        <button style={styles.actionButton}>View Details</button>
        <button style={styles.actionButton}>Close PIP</button>
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
  section: {
    marginBottom: '32px',
  },
  employeeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
  employeeCard: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
    textAlign: 'left',
  },
  empName: {
    fontWeight: '600',
    fontSize: '13px',
    marginBottom: '4px',
  },
  empId: {
    fontSize: '11px',
    color: '#666',
  },
  empDept: {
    fontSize: '11px',
    color: '#999',
  },
  badgeActive: {
    marginTop: '8px',
    padding: '4px 6px',
    backgroundColor: '#FFE082',
    color: '#F57F17',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  filterButtons: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  pipList: {
    display: 'grid',
    gap: '16px',
  },
  pipCard: {
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
  },
  pipCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  pipEmpName: {
    margin: '0 0 4px 0',
    fontSize: '14px',
  },
  pipEmpId: {
    margin: 0,
    fontSize: '11px',
    color: '#666',
  },
  stageBadge: {
    padding: '6px 12px',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  pipProgress: {
    marginBottom: '12px',
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '4px',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s',
  },
  progressText: {
    margin: 0,
    fontSize: '11px',
    color: '#666',
  },
  pipDetails: {
    fontSize: '12px',
    marginBottom: '12px',
  },
  pipActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
  },
  pipFormContainer: {
    border: '2px solid #2563eb',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f0f8ff',
    marginBottom: '24px',
  },
  pipFormHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  formSection: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '6px',
    fontSize: '12px',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    boxSizing: 'border-box',
  },
  disabledInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    backgroundColor: '#f5f5f5',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    minHeight: '80px',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
  },
  checkboxGroup: {
    display: 'grid',
    gap: '8px',
  },
  checkbox: {
    fontSize: '12px',
    cursor: 'pointer',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  pipWarning: {
    padding: '12px',
    backgroundColor: '#FFF3E0',
    borderLeft: '4px solid #FF9800',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '12px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
  },
};
