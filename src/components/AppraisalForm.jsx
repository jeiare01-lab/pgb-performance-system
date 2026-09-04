import { useState } from 'react';

const RATING_SCALE = {
  1: 'Unsatisfactory',
  2: 'Needs Improvement',
  3: 'Meets Expectation',
  4: 'Exceeds Expectation',
  5: 'Outstanding / Exceptional',
};

const KPI_INDICATORS = [
  { id: 'cash', label: 'Stronger Cash Position', description: 'Collections, liquidity, working-capital targets.' },
  { id: 'succession', label: 'Succession Plan in Place', description: 'Identified successors, readiness tiers, Development Rocks.' },
  { id: 'productivity', label: 'Productivity & Process Efficiencies', description: 'Cycle-time, yield, cost-to-output improvements.' },
  { id: 'partnership', label: 'Stronger Partnership & Joint Venture', description: 'Strategic alliances, client/partner scorecards.' },
];

const COMPETENCIES = [
  'Job Knowledge',
  'Decision Making / Problem Solving',
  'Communication',
  'Planning & Organizing',
  'Leadership',
  'Customer Focus',
];

const VALUES = [
  'Integrity',
  'Innovation',
  'Accountability',
  'Team Collaboration',
];

export default function AppraisalForm({ selectedEmployee, onBack }) {
  const [kpiRatings, setKpiRatings] = useState({});
  const [competencyRatings, setCompetencyRatings] = useState({});
  const [valueRatings, setValueRatings] = useState({});
  const [evidence, setEvidence] = useState({});
  const [behaviorNotes, setBehaviorNotes] = useState({});
  const [overallComments, setOverallComments] = useState('');

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

  const getRatingColor = (rating) => {
    if (!rating) return '#f0f0f0';
    if (rating >= 4) return '#4CAF50';
    if (rating === 3) return '#2196F3';
    return '#FF9800';
  };

  const kpiScore = Object.values(kpiRatings).reduce((a, b) => a + (b || 0), 0) / KPI_INDICATORS.length || 0;
  const competencyScore = Object.values(competencyRatings).reduce((a, b) => a + (b || 0), 0) / COMPETENCIES.length || 0;
  const valueScore = Object.values(valueRatings).reduce((a, b) => a + (b || 0), 0) / VALUES.length || 0;
  const overallScore = (kpiScore * 0.5 + competencyScore * 0.3 + valueScore * 0.2).toFixed(2);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>← Back</button>
        <div style={styles.title}>
          <h1>Performance Appraisal Form</h1>
          <p style={styles.subtitle}>Primary Group of Builders · Shared Services · Human Resources</p>
        </div>
      </div>

      {/* Employee Information */}
      <div style={styles.section}>
        <div style={styles.infoGrid}>
          <div style={styles.infoRow}>
            <label>Employee Name:</label>
            <span style={styles.value}>{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
          </div>
          <div style={styles.infoRow}>
            <label>Employee ID:</label>
            <span style={styles.value}>{selectedEmployee.employee_id}</span>
          </div>
          <div style={styles.infoRow}>
            <label>Position / Title:</label>
            <span style={styles.value}>{selectedEmployee.role}</span>
          </div>
          <div style={styles.infoRow}>
            <label>Department / SBU:</label>
            <span style={styles.value}>{selectedEmployee.department}</span>
          </div>
          <div style={styles.infoRow}>
            <label>Job Grade:</label>
            <span style={styles.value}>{selectedEmployee.job_grade}</span>
          </div>
          <div style={styles.infoRow}>
            <label>Evaluation Period:</label>
            <input type="text" placeholder="e.g., Q3 2026" style={styles.input} />
          </div>
        </div>
      </div>

      {/* Rating Scale Legend */}
      <div style={styles.ratingLegend}>
        <h4>Rating Scale:</h4>
        <div style={styles.ratingGrid}>
          {Object.entries(RATING_SCALE).map(([num, label]) => (
            <div key={num} style={styles.ratingItem}>
              <span style={{ ...styles.ratingNumber, backgroundColor: getRatingColor(parseInt(num)) }}>
                {num}
              </span>
              <span style={styles.ratingLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* I. KEY PERFORMANCE INDICATORS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>I. Key Performance Indicators</h2>
        <p style={styles.sectionSubtitle}>Aligned with Company Rocks · Weight: 50%</p>

        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={{ flex: 2, textAlign: 'left' }}>Indicator</th>
              <th style={{ flex: 1.5, textAlign: 'center' }}>Rating</th>
              <th style={{ flex: 2, textAlign: 'left' }}>Evidence / Result</th>
            </tr>
          </thead>
          <tbody>
            {KPI_INDICATORS.map((kpi) => (
              <tr key={kpi.id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <strong>{kpi.label}</strong>
                  <p style={styles.description}>{kpi.description}</p>
                </td>
                <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                  <div style={styles.ratingButtons}>
                    {[1, 2, 3, 4, 5].map(r => (
                      <button
                        key={r}
                        onClick={() => setKpiRatings({ ...kpiRatings, [kpi.id]: r })}
                        style={{
                          ...styles.ratingBtn,
                          backgroundColor: kpiRatings[kpi.id] === r ? getRatingColor(r) : '#f0f0f0',
                          color: kpiRatings[kpi.id] === r ? '#fff' : '#333',
                          fontWeight: kpiRatings[kpi.id] === r ? 'bold' : 'normal',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <textarea
                    placeholder="Enter evidence or results..."
                    value={evidence[kpi.id] || ''}
                    onChange={(e) => setEvidence({ ...evidence, [kpi.id]: e.target.value })}
                    style={styles.textarea}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.scoreRow}>
          <span style={styles.scoreLabel}>KPI Average Score:</span>
          <span style={styles.scoreValue}>{kpiScore.toFixed(2)}</span>
        </div>
      </div>

      {/* II. COMPETENCIES */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>II. Competencies</h2>
        <p style={styles.sectionSubtitle}>Demonstrated Behavior · Weight: 30%</p>

        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={{ flex: 1.5, textAlign: 'left' }}>Competency</th>
              <th style={{ flex: 1, textAlign: 'center' }}>Rating</th>
              <th style={{ flex: 2, textAlign: 'left' }}>Observed Behavior</th>
            </tr>
          </thead>
          <tbody>
            {COMPETENCIES.map((comp) => (
              <tr key={comp} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <strong>{comp}</strong>
                </td>
                <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                  <div style={styles.ratingButtons}>
                    {[1, 2, 3, 4, 5].map(r => (
                      <button
                        key={r}
                        onClick={() => setCompetencyRatings({ ...competencyRatings, [comp]: r })}
                        style={{
                          ...styles.ratingBtn,
                          backgroundColor: competencyRatings[comp] === r ? getRatingColor(r) : '#f0f0f0',
                          color: competencyRatings[comp] === r ? '#fff' : '#333',
                          fontWeight: competencyRatings[comp] === r ? 'bold' : 'normal',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <textarea
                    placeholder="Describe observed behavior..."
                    value={behaviorNotes[comp] || ''}
                    onChange={(e) => setBehaviorNotes({ ...behaviorNotes, [comp]: e.target.value })}
                    style={styles.textarea}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.scoreRow}>
          <span style={styles.scoreLabel}>Competency Average Score:</span>
          <span style={styles.scoreValue}>{competencyScore.toFixed(2)}</span>
        </div>
      </div>

      {/* III. PERSONAL ATTRIBUTES / VALUES */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>III. Personal Attributes & Values Alignment</h2>
        <p style={styles.sectionSubtitle}>Cultural Fit · Weight: 20%</p>

        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={{ flex: 1.5, textAlign: 'left' }}>Value / Attribute</th>
              <th style={{ flex: 1, textAlign: 'center' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {VALUES.map((val) => (
              <tr key={val} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <strong>{val}</strong>
                </td>
                <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                  <div style={styles.ratingButtons}>
                    {[1, 2, 3, 4, 5].map(r => (
                      <button
                        key={r}
                        onClick={() => setValueRatings({ ...valueRatings, [val]: r })}
                        style={{
                          ...styles.ratingBtn,
                          backgroundColor: valueRatings[val] === r ? getRatingColor(r) : '#f0f0f0',
                          color: valueRatings[val] === r ? '#fff' : '#333',
                          fontWeight: valueRatings[val] === r ? 'bold' : 'normal',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.scoreRow}>
          <span style={styles.scoreLabel}>Values Average Score:</span>
          <span style={styles.scoreValue}>{valueScore.toFixed(2)}</span>
        </div>
      </div>

      {/* OVERALL SCORE */}
      <div style={styles.overallSection}>
        <h3>Overall Performance Score</h3>
        <div style={styles.overallCalculation}>
          <div style={styles.calcItem}>
            KPI {kpiScore.toFixed(2)} × 50% = <strong>{(kpiScore * 0.5).toFixed(2)}</strong>
          </div>
          <div style={styles.calcItem}>
            Competencies {competencyScore.toFixed(2)} × 30% = <strong>{(competencyScore * 0.3).toFixed(2)}</strong>
          </div>
          <div style={styles.calcItem}>
            Values {valueScore.toFixed(2)} × 20% = <strong>{(valueScore * 0.2).toFixed(2)}</strong>
          </div>
          <div style={styles.totalScore}>
            <strong>OVERALL SCORE: {overallScore}</strong>
          </div>
        </div>
      </div>

      {/* COMMENTS */}
      <div style={styles.section}>
        <h3>Overall Comments & Development Plan</h3>
        <textarea
          placeholder="Summary of performance, strengths, areas for improvement, and recommended development actions..."
          value={overallComments}
          onChange={(e) => setOverallComments(e.target.value)}
          style={{ ...styles.textarea, minHeight: '100px' }}
        />
      </div>

      {/* Actions */}
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
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: '24px',
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
  title: {
    borderBottom: '2px solid #333',
    paddingBottom: '12px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  noEmployee: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px',
    borderBottom: '2px solid #333',
    paddingBottom: '8px',
  },
  sectionSubtitle: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '16px',
    fontStyle: 'italic',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '12px',
    backgroundColor: '#f9f9f9',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  input: {
    padding: '6px',
    border: '1px solid #ddd',
    borderRadius: '3px',
    fontSize: '12px',
  },
  value: {
    fontWeight: '500',
  },
  ratingLegend: {
    marginBottom: '24px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  ratingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '8px',
    marginTop: '8px',
  },
  ratingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
  },
  ratingNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
    border: '1px solid #ddd',
  },
  tableHeader: {
    backgroundColor: '#333',
    color: '#fff',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
  },
  tableCell: {
    padding: '12px',
    fontSize: '12px',
    verticalAlign: 'top',
  },
  description: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
    margin: '4px 0 0 0',
  },
  ratingButtons: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  ratingBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '3px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    fontSize: '12px',
  },
  textarea: {
    width: '100%',
    padding: '6px',
    border: '1px solid #ddd',
    borderRadius: '3px',
    fontSize: '11px',
    fontFamily: 'sans-serif',
    minHeight: '40px',
    boxSizing: 'border-box',
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '8px 12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#666',
  },
  scoreValue: {
    color: '#2563eb',
    fontSize: '16px',
  },
  overallSection: {
    padding: '16px',
    backgroundColor: '#f0f8ff',
    borderRadius: '6px',
    border: '2px solid #2563eb',
    marginBottom: '24px',
  },
  overallCalculation: {
    fontSize: '12px',
    marginTop: '8px',
  },
  calcItem: {
    padding: '4px 0',
  },
  totalScore: {
    padding: '8px 0',
    fontSize: '14px',
    borderTop: '1px solid #2563eb',
    marginTop: '8px',
    color: '#2563eb',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #ddd',
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
