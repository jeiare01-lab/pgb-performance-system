import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const KPI_LIST = [
  { id: 'cash', name: 'Stronger Cash Position', desc: 'Collections, liquidity, working-capital targets.' },
  { id: 'succession', name: 'Succession Plan in Place', desc: 'Identified successors, readiness tiers, Development Rocks.' },
  { id: 'productivity', name: 'Productivity & Process Efficiencies', desc: 'Cycle-time, yield, cost-to-output improvements.' },
  { id: 'partnership', name: 'Stronger Partnership & Joint Venture', desc: 'Strategic alliances, client/partner scorecards.' },
];

export default function KPITracker() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedKPI, setSelectedKPI] = useState('cash');
  const [kpiScores, setKpiScores] = useState({});
  const [businessUnitFilter, setBusinessUnitFilter] = useState('all');
  const [businessUnits, setBusinessUnits] = useState([]);

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

      if (err) {
        setError(err.message);
        return;
      }

      setEmployees(data || []);

      // Extract unique business units
      const units = [...new Set(data.map(e => e.department))].filter(Boolean);
      setBusinessUnits(units);

      // Initialize random KPI scores for demo
      const scores = {};
      data.forEach(emp => {
        KPI_LIST.forEach(kpi => {
          scores[`${emp.employee_id}-${kpi.id}`] = Math.floor(Math.random() * 5) + 1;
        });
      });
      setKpiScores(scores);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = businessUnitFilter === 'all' 
    ? employees 
    : employees.filter(e => e.department === businessUnitFilter);

  const kpiData = KPI_LIST.find(k => k.id === selectedKPI);
  const kpiScoresForSelected = filtered.map(emp => ({
    ...emp,
    kpiScore: kpiScores[`${emp.employee_id}-${selectedKPI}`] || 0,
  })).sort((a, b) => (b.kpiScore || 0) - (a.kpiScore || 0));

  const avgScore = kpiScoresForSelected.length > 0
    ? (kpiScoresForSelected.reduce((sum, e) => sum + (e.kpiScore || 0), 0) / kpiScoresForSelected.length).toFixed(2)
    : 0;

  const getRatingColor = (score) => {
    if (!score) return '#f0f0f0';
    if (score >= 4) return '#4CAF50';
    if (score === 3) return '#2196F3';
    return '#FF9800';
  };

  const getRatingLabel = (score) => {
    if (!score) return '—';
    if (score === 1) return 'Unsatisfactory';
    if (score === 2) return 'Needs Improvement';
    if (score === 3) return 'Meets Expectation';
    if (score === 4) return 'Exceeds Expectation';
    if (score === 5) return 'Outstanding';
  };

  return (
    <div style={styles.container}>
      <h2>KPI Tracker</h2>
      <p style={styles.subtitle}>Performance against Company Rocks · FY 2026</p>

      {error && (
        <div style={styles.error}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <p>Loading KPI data...</p>
      ) : (
        <>
          {/* KPI Selection */}
          <div style={styles.kpiSelector}>
            <h3>Select KPI:</h3>
            <div style={styles.kpiButtons}>
              {KPI_LIST.map(kpi => (
                <button
                  key={kpi.id}
                  onClick={() => setSelectedKPI(kpi.id)}
                  style={{
                    ...styles.kpiButton,
                    backgroundColor: selectedKPI === kpi.id ? '#2563eb' : '#f0f0f0',
                    color: selectedKPI === kpi.id ? '#fff' : '#333',
                    borderColor: selectedKPI === kpi.id ? '#2563eb' : '#ddd',
                  }}
                >
                  {kpi.name}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Details */}
          {kpiData && (
            <div style={styles.kpiDetails}>
              <h3>{kpiData.name}</h3>
              <p style={styles.kpiDesc}>{kpiData.desc}</p>
              <div style={styles.kpiStats}>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Org Average Score</span>
                  <span style={styles.statValue}>{avgScore}/5.00</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Employees Tracked</span>
                  <span style={styles.statValue}>{filtered.length}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>High Performers (4-5)</span>
                  <span style={styles.statValue}>
                    {kpiScoresForSelected.filter(e => e.kpiScore >= 4).length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Business Unit Filter */}
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Business Unit:</label>
            <select
              value={businessUnitFilter}
              onChange={(e) => setBusinessUnitFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Business Units</option>
              {businessUnits.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          {/* KPI Scores Table */}
          <div style={styles.tableSection}>
            <h4 style={styles.tableTitle}>Performance by Employee</h4>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <div style={{ flex: 1.5 }}>NAME</div>
                <div style={{ flex: 0.9 }}>IDNO</div>
                <div style={{ flex: 1.2 }}>BUSINESS UNIT</div>
                <div style={{ flex: 0.8 }}>JOB GRADE</div>
                <div style={{ flex: 1 }}>KPI SCORE</div>
                <div style={{ flex: 1.2 }}>RATING</div>
              </div>
              {kpiScoresForSelected.map((emp, idx) => (
                <div key={emp.employee_id} style={{
                  ...styles.tableRow,
                  backgroundColor: idx % 2 === 0 ? '#f9f9f9' : '#fff',
                }}>
                  <div style={{ flex: 1.5, fontWeight: '500' }}>
                    {emp.last_name}, {emp.first_name}
                  </div>
                  <div style={{ flex: 0.9, fontSize: '12px', color: '#666' }}>
                    {emp.employee_id}
                  </div>
                  <div style={{ flex: 1.2, fontSize: '12px' }}>
                    {emp.department}
                  </div>
                  <div style={{ flex: 0.8, textAlign: 'center' }}>
                    {emp.job_grade}
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
                    {emp.kpiScore || '—'}
                  </div>
                  <div style={{ flex: 1.2 }}>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: getRatingColor(emp.kpiScore),
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}>
                      {getRatingLabel(emp.kpiScore)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Chart */}
          <div style={styles.chartSection}>
            <h4 style={styles.chartTitle}>Score Distribution</h4>
            <div style={styles.distributionGrid}>
              {[1, 2, 3, 4, 5].map(rating => {
                const count = kpiScoresForSelected.filter(e => e.kpiScore === rating).length;
                const percentage = kpiScoresForSelected.length > 0 ? ((count / kpiScoresForSelected.length) * 100).toFixed(0) : 0;
                return (
                  <div key={rating} style={styles.distributionItem}>
                    <div style={styles.distLabel}>
                      {rating === 1 && 'Unsatisfactory'}
                      {rating === 2 && 'Needs Improvement'}
                      {rating === 3 && 'Meets'}
                      {rating === 4 && 'Exceeds'}
                      {rating === 5 && 'Outstanding'}
                    </div>
                    <div style={{
                      ...styles.distBar,
                      backgroundColor: getRatingColor(rating),
                      height: `${Math.max(20, percentage * 2)}px`,
                    }} />
                    <div style={styles.distValue}>
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1100px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#666',
    margin: '4px 0 20px 0',
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
  kpiSelector: {
    marginBottom: '24px',
  },
  kpiButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '8px',
    marginTop: '8px',
  },
  kpiButton: {
    padding: '10px 12px',
    border: '1px solid',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  kpiDetails: {
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
  },
  kpiDesc: {
    fontSize: '12px',
    color: '#666',
    margin: '8px 0 12px 0',
  },
  kpiStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginTop: '12px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px',
    backgroundColor: '#fff',
    borderRadius: '4px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2563eb',
  },
  filterSection: {
    marginBottom: '20px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '500',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    minWidth: '200px',
  },
  tableSection: {
    marginBottom: '24px',
  },
  tableTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  table: {
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  tableHeader: {
    display: 'flex',
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px 12px',
    fontWeight: 'bold',
    fontSize: '12px',
    gap: '8px',
  },
  tableRow: {
    display: 'flex',
    padding: '10px 12px',
    borderBottom: '1px solid #eee',
    fontSize: '12px',
    gap: '8px',
    alignItems: 'center',
  },
  chartSection: {
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  chartTitle: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  distributionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
  },
  distributionItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  distLabel: {
    fontSize: '11px',
    fontWeight: '500',
    marginBottom: '8px',
    textAlign: 'center',
  },
  distBar: {
    width: '100%',
    borderRadius: '3px',
    marginBottom: '4px',
    minHeight: '20px',
  },
  distValue: {
    fontSize: '11px',
    color: '#666',
  },
};
