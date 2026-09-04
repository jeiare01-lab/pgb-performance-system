import { useState } from 'react';

export default function AppraisalForm({ selectedEmployee, onBack }) {
  const [rating, setRating] = useState(selectedEmployee?.performance_rating || 0);
  const [kpis, setKpis] = useState(selectedEmployee?.kpis || []);
  const [competencies, setCompetencies] = useState(selectedEmployee?.competencies || []);
  const [values, setValues] = useState(selectedEmployee?.values || []);
  const [comments, setComments] = useState(selectedEmployee?.comments || '');

  if (!selectedEmployee) {
    return (
      <div style={styles.container}>
        <p style={styles.noEmployee}>Select an employee from the Dashboard to view their appraisal.</p>
      </div>
    );
  }

  const handleSave = () => {
    alert(`Appraisal saved for ${selectedEmployee.first_name} ${selectedEmployee.last_name}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>← Back to Dashboard</button>
        <h2>Appraisal Form</h2>
      </div>

      <div style={styles.employeeCard}>
        <div style={styles.employeeHeader}>
          <div>
            <h3>{selectedEmployee.first_name} {selectedEmployee.last_name}</h3>
            <p style={styles.employeeId}>{selectedEmployee.employee_id}</p>
          </div>
          <div style={styles.employeeDetails}>
            <p><strong>Role:</strong> {selectedEmployee.role}</p>
            <p><strong>Grade:</strong> {selectedEmployee.job_grade}</p>
            <p><strong>Department:</strong> {selectedEmployee.department}</p>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3>Overall Rating</h3>
        <div style={styles.ratingScale}>
          {[1, 2, 3, 4, 5].map(r => (
            <button
              key={r}
              onClick={() => setRating(r)}
              style={{
                ...styles.ratingButton,
                backgroundColor: rating === r ? '#2563eb' : '#f0f0f0',
                color: rating === r ? '#fff' : '#333',
                border: rating === r ? '2px solid #2563eb' : '1px solid #ddd',
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <p style={styles.ratingLabel}>1 = Needs Improvement, 5 = Exceeds Expectations</p>
      </div>

      <div style={styles.section}>
        <h3>KPI Performance (50%)</h3>
        <div style={styles.scoreGrid}>
          <div style={styles.scoreItem}>
            <label>Sales Target Achievement</label>
            <input type="number" defaultValue="85" style={styles.input} />
          </div>
          <div style={styles.scoreItem}>
            <label>Quality Metrics</label>
            <input type="number" defaultValue="92" style={styles.input} />
          </div>
          <div style={styles.scoreItem}>
            <label>Timeliness</label>
            <input type="number" defaultValue="88" style={styles.input} />
          </div>
          <div style={styles.scoreItem}>
            <label>Customer Satisfaction</label>
            <input type="number" defaultValue="90" style={styles.input} />
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h3>Competencies (30%)</h3>
        <div style={styles.competenciesList}>
          {['Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Technical Skills'].map(comp => (
            <div key={comp} style={styles.competencyItem}>
              <label>{comp}</label>
              <select defaultValue="3" style={styles.select}>
                <option value="1">1 - Below Expectations</option>
                <option value="2">2 - Needs Improvement</option>
                <option value="3">3 - Meets Expectations</option>
                <option value="4">4 - Exceeds Expectations</option>
                <option value="5">5 - Far Exceeds</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3>Values Alignment (20%)</h3>
        <div style={styles.competenciesList}>
          {['Integrity', 'Customer Focus', 'Innovation', 'Accountability'].map(val => (
            <div key={val} style={styles.competencyItem}>
              <label>{val}</label>
              <select defaultValue="3" style={styles.select}>
                <option value="1">1 - Below Expectations</option>
                <option value="2">2 - Needs Improvement</option>
                <option value="3">3 - Meets Expectations</option>
                <option value="4">4 - Exceeds Expectations</option>
                <option value="5">5 - Far Exceeds</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3>Comments & Development Areas</h3>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter feedback, areas for improvement, and development recommendations..."
          style={styles.textarea}
        />
      </div>

      <div style={styles.actions}>
        <button onClick={onBack} style={styles.cancelButton}>Cancel</button>
        <button onClick={handleSave} style={styles.saveButton}>Save Appraisal</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
  },
  header: {
    marginBottom: '20px',
  },
  backButton: {
    padding: '8px 12px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    marginBottom: '12px',
  },
  noEmployee: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    textAlign: 'center',
    color: '#666',
  },
  employeeCard: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  employeeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  employeeId: {
    fontSize: '12px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  employeeDetails: {
    fontSize: '12px',
  },
  section: {
    marginBottom: '24px',
  },
  ratingScale: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  ratingButton: {
    width: '40px',
    height: '40px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  ratingLabel: {
    fontSize: '12px',
    color: '#666',
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  scoreItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    marginTop: '4px',
  },
  competenciesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  competencyItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  select: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    marginTop: '4px',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};
