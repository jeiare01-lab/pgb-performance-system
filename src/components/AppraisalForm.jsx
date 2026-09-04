import { useState } from 'react';
import { supabase } from '../lib/supabase';

const KPI_INDICATORS = [
  { label: 'Stronger Cash Position', desc: 'Collections, liquidity, working-capital targets.' },
  { label: 'Succession Plan in Place', desc: 'Identified successors, readiness tiers, Development Rocks.' },
  { label: 'Productivity & Process Efficiencies', desc: 'Cycle-time, yield, cost-to-output improvements.' },
  { label: 'Stronger Partnership & Joint Venture', desc: 'Strategic alliances, client/partner scorecards.' },
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
  { label: 'Built on Trust — Pagsalig', desc: 'Integrity, reliability, keeps commitments.' },
  { label: 'We Keep Going — Pagkugi', desc: 'Initiative, energy, resilience under pressure.' },
  { label: 'We Get Things Done Together — Hiniusang Pagtutok', desc: 'Teamwork, collaboration, shared focus on goals.' },
  { label: 'We Strive To Make Things Better — Pagpalambo', desc: 'Innovation, learning, continuous improvement.' },
];

export default function AppraisalForm({ selectedEmployee, onBack }) {
  const [kpiRatings, setKpiRatings] = useState({});
  const [competencyRatings, setCompetencyRatings] = useState({});
  const [valueRatings, setValueRatings] = useState({});
  const [kpiEvidence, setKpiEvidence] = useState({});
  const [competencyBehavior, setCompetencyBehavior] = useState({});
  const [valueEvidence, setValueEvidence] = useState({});
  const [evaluationPeriod, setEvaluationPeriod] = useState('');
  const [immediateSupervisor, setImmediateSupervisor] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [saving, setSaving] = useState(false);

  if (!selectedEmployee) {
    return (
      <div style={styles.container}>
        <p style={styles.noEmployee}>Select an employee from the Dashboard to view their appraisal.</p>
      </div>
    );
  }

  const kpiAvg = Object.values(kpiRatings).length > 0 
    ? (Object.values(kpiRatings).reduce((a, b) => a + b, 0) / Object.values(kpiRatings).length).toFixed(2)
    : '—';
  const competencyAvg = Object.values(competencyRatings).length > 0
    ? (Object.values(competencyRatings).reduce((a, b) => a + b, 0) / Object.values(competencyRatings).length).toFixed(2)
    : '—';
  const valueAvg = Object.values(valueRatings).length > 0
    ? (Object.values(valueRatings).reduce((a, b) => a + b, 0) / Object.values(valueRatings).length).toFixed(2)
    : '—';

  const total = kpiAvg !== '—' && competencyAvg !== '—' && valueAvg !== '—'
    ? ((parseFloat(kpiAvg) * 0.5) + (parseFloat(competencyAvg) * 0.3) + (parseFloat(valueAvg) * 0.2)).toFixed(2)
    : '—';

  const handleSave = async () => {
    try {
      // Validate that all sections have ratings
      if (total === '—') {
        alert('Please rate all sections (KPIs, Competencies, and Values) before saving.');
        return;
      }

      setSaving(true);
      const overallScore = parseFloat(total);

      // Update employee's performance_rating in Supabase
      const { error } = await supabase
        .from('employees')
        .update({ performance_rating: overallScore })
        .eq('employee_id', selectedEmployee.employee_id);

      setSaving(false);

      if (error) {
        alert(`Error saving: ${error.message}`);
        return;
      }

      alert(`✓ Appraisal saved successfully!\nOverall Rating: ${overallScore}/5.00\n\nThe Dashboard will now reflect this rating.`);
      // Optionally go back to dashboard after saving
      // onBack();
    } catch (e) {
      setSaving(false);
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <div style={styles.container}>
      {/* Back button */}
      <button onClick={onBack} style={styles.backButton}>← Back</button>

      {/* Header */}
      <div style={styles.headerBox}>
        <div style={styles.headerTitle}>
          <div style={styles.pgbLogo}>P</div>
          <div>
            <h3 style={styles.mainTitle}>Performance Appraisal</h3>
            <p style={styles.headerSubtitle}>Primary Group of Builders · SHARED SERVICES · HUMAN RESOURCES</p>
            <p style={styles.headerSubtitle}>REVISED FRAMEWORK · FY 2026</p>
          </div>
        </div>
      </div>

      {/* Employee Info Section */}
      <div style={styles.infoSection}>
        <div style={styles.infoRow}>
          <div style={styles.infoField}>
            <label>EMPLOYEE NAME</label>
            <p style={styles.infoValue}>{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
          </div>
          <div style={styles.infoField}>
            <label>EMPLOYEE ID</label>
            <p style={styles.infoValue}>{selectedEmployee.employee_id}</p>
          </div>
          <div style={styles.infoField}>
            <label>DATE</label>
            <input type="date" style={styles.infoInput} />
          </div>
        </div>

        <div style={styles.infoRow}>
          <div style={styles.infoField}>
            <label>POSITION / TITLE</label>
            <p style={styles.infoValue}>{selectedEmployee.role}</p>
          </div>
          <div style={styles.infoField}>
            <label>DEPARTMENT / SBU</label>
            <p style={styles.infoValue}>{selectedEmployee.department}</p>
          </div>
          <div style={styles.infoField}>
            <label>COMPANY</label>
            <p style={styles.infoValue}>—</p>
          </div>
        </div>

        <div style={styles.infoRow}>
          <div style={styles.infoField}>
            <label>EVALUATION PERIOD</label>
            <input type="text" placeholder="e.g., Q3 2026" value={evaluationPeriod} onChange={(e) => setEvaluationPeriod(e.target.value)} style={styles.infoInput} />
          </div>
          <div style={styles.infoField}>
            <label>IMMEDIATE SUPERVISOR</label>
            <input type="text" value={immediateSupervisor} onChange={(e) => setImmediateSupervisor(e.target.value)} style={styles.infoInput} />
          </div>
          <div style={styles.infoField}>
            <label>REVIEWER</label>
            <input type="text" value={reviewer} onChange={(e) => setReviewer(e.target.value)} style={styles.infoInput} />
          </div>
        </div>
      </div>

      {/* Rating Scale */}
      <div style={styles.ratingScale}>
        <div style={styles.ratingItem}>1 Unsatisfactory</div>
        <div style={styles.ratingItem}>2 Needs Improvement</div>
        <div style={styles.ratingItem}>3 Meets Expectation</div>
        <div style={styles.ratingItem}>4 Exceeds Expectation</div>
        <div style={styles.ratingItem}>5 Outstanding / Exceptional</div>
      </div>

      {/* I. KPIs */}
      <div style={styles.section}>
        <h3 style={styles.sectionHeader}>
          I. Key Performance Indicators
          <span style={styles.weight}>Aligned with Company Rocks · weight 50%</span>
        </h3>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.th, flex: 2 }}>INDICATOR</th>
                <th style={{ ...styles.th, flex: 1, textAlign: 'center' }}>1 2 3 4 5</th>
                <th style={{ ...styles.th, flex: 2 }}>EVIDENCE / RESULT</th>
              </tr>
            </thead>
            <tbody>
              {KPI_INDICATORS.map((kpi, idx) => (
                <tr key={idx} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{kpi.label}</strong>
                    <p style={styles.description}>{kpi.desc}</p>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={styles.ratingButtonsInline}>
                      {[1, 2, 3, 4, 5].map(r => (
                        <button
                          key={r}
                          onClick={() => setKpiRatings({ ...kpiRatings, [idx]: r })}
                          style={{
                            ...styles.ratingButtonSmall,
                            backgroundColor: kpiRatings[idx] === r ? '#333' : '#fff',
                            color: kpiRatings[idx] === r ? '#fff' : '#333',
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <textarea
                      placeholder="Evidence..."
                      value={kpiEvidence[idx] || ''}
                      onChange={(e) => setKpiEvidence({ ...kpiEvidence, [idx]: e.target.value })}
                      style={styles.smallTextarea}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* II. Competencies */}
      <div style={styles.section}>
        <h3 style={styles.sectionHeader}>
          II. Competencies
          <span style={styles.weight}>Demonstrated behavior · weight 30%</span>
        </h3>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.th, flex: 1.5 }}>COMPETENCY</th>
                <th style={{ ...styles.th, flex: 1, textAlign: 'center' }}>1 2 3 4 5</th>
                <th style={{ ...styles.th, flex: 2 }}>OBSERVED BEHAVIOR</th>
              </tr>
            </thead>
            <tbody>
              {COMPETENCIES.map((comp, idx) => (
                <tr key={idx} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{comp}</strong>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={styles.ratingButtonsInline}>
                      {[1, 2, 3, 4, 5].map(r => (
                        <button
                          key={r}
                          onClick={() => setCompetencyRatings({ ...competencyRatings, [idx]: r })}
                          style={{
                            ...styles.ratingButtonSmall,
                            backgroundColor: competencyRatings[idx] === r ? '#333' : '#fff',
                            color: competencyRatings[idx] === r ? '#fff' : '#333',
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <textarea
                      placeholder="Observed behavior..."
                      value={competencyBehavior[idx] || ''}
                      onChange={(e) => setCompetencyBehavior({ ...competencyBehavior, [idx]: e.target.value })}
                      style={styles.smallTextarea}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* III. Personal Attributes */}
      <div style={styles.section}>
        <h3 style={styles.sectionHeader}>
          III. Personal Attributes
          <span style={styles.weight}>Anchored on PGB Corporate Values · weight 20%</span>
        </h3>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.th, flex: 2 }}>VALUE & BEHAVIOR</th>
                <th style={{ ...styles.th, flex: 1, textAlign: 'center' }}>1 2 3 4 5</th>
                <th style={{ ...styles.th, flex: 2 }}>EXAMPLE / EVIDENCE</th>
              </tr>
            </thead>
            <tbody>
              {VALUES.map((val, idx) => (
                <tr key={idx} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{val.label}</strong>
                    <p style={styles.description}>{val.desc}</p>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={styles.ratingButtonsInline}>
                      {[1, 2, 3, 4, 5].map(r => (
                        <button
                          key={r}
                          onClick={() => setValueRatings({ ...valueRatings, [idx]: r })}
                          style={{
                            ...styles.ratingButtonSmall,
                            backgroundColor: valueRatings[idx] === r ? '#333' : '#fff',
                            color: valueRatings[idx] === r ? '#fff' : '#333',
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <textarea
                      placeholder="Example/evidence..."
                      value={valueEvidence[idx] || ''}
                      onChange={(e) => setValueEvidence({ ...valueEvidence, [idx]: e.target.value })}
                      style={styles.smallTextarea}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overall Rating Section */}
      <div style={styles.overallSection}>
        <div style={styles.overallRow}>
          <div>
            <h4>Overall Performance Rating</h4>
            <div style={styles.ratingBoxes}>
              <div style={styles.ratingBox}>Unsatisfactory</div>
              <div style={styles.ratingBox}>Needs Improvement</div>
              <div style={styles.ratingBox}>Meets Expectation</div>
              <div style={styles.ratingBox}>Exceeds Expectation</div>
              <div style={styles.ratingBox}>Outstanding / Exceptional</div>
            </div>
          </div>

          <div style={styles.weightedScore}>
            <h4>Weighted Score</h4>
            <div style={styles.scoreCalc}>
              <div>KPI (50%): <strong>{kpiAvg}</strong></div>
              <div>Competency (30%): <strong>{competencyAvg}</strong></div>
              <div>Attributes (20%): <strong>{valueAvg}</strong></div>
              <div style={styles.totalScoreLine}>Total: <strong>{total} / 5.00</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div style={styles.signatureSection}>
        <div style={styles.signatureRow}>
          <div style={styles.signatureBox}>
            <p>_________________________</p>
            <p><strong>Employee</strong></p>
            <p style={styles.signatureDate}>Date: __________</p>
          </div>
          <div style={styles.signatureBox}>
            <p>_________________________</p>
            <p><strong>Immediate Supervisor</strong></p>
            <p style={styles.signatureDate}>Date: __________</p>
          </div>
          <div style={styles.signatureBox}>
            <p>_________________________</p>
            <p><strong>Reviewer / HR</strong></p>
            <p style={styles.signatureDate}>Date: __________</p>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <p>PGB HR · PERFORMANCE APPRAISAL · REV. 2026 · Pagsalig · Pagkugi · Hiniusang Pagtutok · Pagpalambo</p>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button onClick={onBack} style={styles.cancelButton}>Cancel</button>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{
            ...styles.saveButton,
            opacity: saving ? 0.6 : 1,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save Appraisal'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1100px',
    margin: '0 auto',
    backgroundColor: '#fff',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  backButton: {
    padding: '8px 12px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
    marginBottom: '16px',
  },
  headerBox: {
    marginBottom: '20px',
  },
  headerTitle: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  pgbLogo: {
    width: '40px',
    height: '40px',
    backgroundColor: '#333',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    borderRadius: '4px',
  },
  mainTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
  },
  headerSubtitle: {
    margin: '2px 0',
    fontSize: '11px',
    color: '#666',
  },
  noEmployee: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    textAlign: 'center',
    color: '#666',
  },
  infoSection: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    padding: '12px',
    borderBottom: '1px solid #e0e0e0',
  },
  infoField: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoValue: {
    margin: '4px 0',
    fontWeight: '500',
    fontSize: '13px',
  },
  infoInput: {
    padding: '6px',
    border: '1px solid #ddd',
    borderRadius: '3px',
    fontSize: '12px',
  },
  ratingScale: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '11px',
  },
  ratingItem: {
    textAlign: 'center',
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0 0 12px 0',
    paddingBottom: '8px',
    borderBottom: '2px solid #333',
    fontSize: '14px',
  },
  weight: {
    fontSize: '11px',
    color: '#666',
    fontWeight: 'normal',
  },
  tableWrapper: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#333',
    color: '#fff',
  },
  th: {
    padding: '8px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: '8px',
    fontSize: '12px',
    verticalAlign: 'top',
  },
  description: {
    margin: '4px 0 0 0',
    fontSize: '11px',
    color: '#666',
  },
  ratingButtonsInline: {
    display: 'flex',
    gap: '3px',
  },
  ratingButtonSmall: {
    width: '24px',
    height: '24px',
    padding: '0',
    border: '1px solid #ccc',
    borderRadius: '2px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  smallTextarea: {
    width: '100%',
    padding: '4px',
    border: '1px solid #ddd',
    borderRadius: '2px',
    fontSize: '11px',
    minHeight: '40px',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
  },
  overallSection: {
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
  },
  overallRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  ratingBoxes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '4px',
    marginTop: '8px',
  },
  ratingBox: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    textAlign: 'center',
    fontSize: '11px',
    backgroundColor: '#fff',
  },
  weightedScore: {
    backgroundColor: '#fff',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  scoreCalc: {
    fontSize: '12px',
    lineHeight: '1.6',
  },
  totalScoreLine: {
    borderTop: '1px solid #ccc',
    paddingTop: '4px',
    marginTop: '4px',
    fontWeight: 'bold',
  },
  signatureSection: {
    marginBottom: '20px',
  },
  signatureRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  signatureBox: {
    textAlign: 'center',
    fontSize: '11px',
  },
  signatureDate: {
    fontSize: '10px',
    marginTop: '4px',
  },
  footer: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#666',
    borderTop: '1px solid #ddd',
    paddingTop: '8px',
    marginBottom: '20px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    paddingTop: '12px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
};
