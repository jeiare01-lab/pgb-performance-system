import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard({ selectedEmployee, onEmployeeSelect, filter = 'all', setFilter }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError('');

      const { data, error: err } = await supabase
        .from('employees')
        .select('employee_id, first_name, last_name, email, company_id, role, job_grade, department, performance_rating')
        .order('first_name', { ascending: true });

      if (err) {
        setError(`Query error: ${err.message}`);
        return;
      }

      setEmployees(data || []);
    } catch (e) {
      setError(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  const highPerformers = employees.filter(e => e.performance_rating && e.performance_rating >= 4);
  const pendingRatings = employees.filter(e => !e.performance_rating);

  // Apply filters
  let filtered = employees;
  if (filter === 'high-performers') {
    filtered = highPerformers;
  } else if (filter === 'pending') {
    filtered = pendingRatings;
  }

  // Apply search
  if (searchFilter) {
    const search = searchFilter.toLowerCase();
    filtered = filtered.filter(e => {
      const str = `${e.first_name} ${e.last_name} ${e.employee_id} ${e.role}`.toLowerCase();
      return str.includes(search);
    });
  }

  return (
    <div style={styles.container}>
      <h2>Dashboard</h2>

      {error && (
        <div style={styles.error}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      <div style={styles.stats}>
        <div
          onClick={() => setFilter('all')}
          style={{
            ...styles.stat,
            backgroundColor: filter === 'all' ? '#e3f2fd' : '#f5f5f5',
            borderLeft: filter === 'all' ? '4px solid #2563eb' : 'none',
            cursor: 'pointer',
          }}
        >
          <div style={styles.number}>{employees.length}</div>
          <div style={styles.label}>Total Employees</div>
        </div>

        <div
          onClick={() => setFilter('high-performers')}
          style={{
            ...styles.stat,
            backgroundColor: filter === 'high-performers' ? '#e8f5e9' : '#f5f5f5',
            borderLeft: filter === 'high-performers' ? '4px solid #4CAF50' : 'none',
            cursor: 'pointer',
          }}
        >
          <div style={styles.number}>{highPerformers.length}</div>
          <div style={styles.label}>High Performers (4-5)</div>
        </div>

        <div
          onClick={() => setFilter('pending')}
          style={{
            ...styles.stat,
            backgroundColor: filter === 'pending' ? '#fff3e0' : '#f5f5f5',
            borderLeft: filter === 'pending' ? '4px solid #ff9800' : 'none',
            cursor: 'pointer',
          }}
        >
          <div style={styles.number}>{pendingRatings.length}</div>
          <div style={styles.label}>Pending Rating</div>
        </div>
      </div>

      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <div>
          <div style={styles.filterBar}>
            <input
              type="text"
              placeholder="Search by name, IDNO, or role..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={styles.search}
            />
            {filter !== 'all' && (
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchFilter('');
                }}
                style={styles.clearButton}
              >
                Clear Filter
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p style={styles.empty}>No employees found.</p>
          ) : (
            <div style={styles.table}>
              <div style={styles.header}>
                <div style={{ flex: 1.5 }}>NAME</div>
                <div style={{ flex: 0.9 }}>IDNO</div>
                <div style={{ flex: 1.2 }}>BUSINESS UNIT</div>
                <div style={{ flex: 1.5 }}>ROLE</div>
                <div style={{ flex: 0.7 }}>JOB GRADE</div>
                <div style={{ flex: 0.9 }}>OVERALL RATING</div>
              </div>
              {filtered.map((emp, idx) => (
                <div
                  key={emp.employee_id}
                  onClick={() => onEmployeeSelect(emp)}
                  style={{
                    ...styles.row,
                    backgroundColor: idx % 2 === 0 ? '#f9f9f9' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1.5, fontWeight: '500', color: '#2563eb' }}>
                    {emp.last_name}, {emp.first_name}
                  </div>
                  <div style={{ flex: 0.9, fontSize: '12px', color: '#666' }}>
                    {emp.employee_id}
                  </div>
                  <div style={{ flex: 1.2, fontSize: '12px' }}>
                    {emp.department}
                  </div>
                  <div style={{ flex: 1.5, fontSize: '12px' }}>
                    {emp.role}
                  </div>
                  <div style={{ flex: 0.7, textAlign: 'center' }}>{emp.job_grade}</div>
                  <div style={{ flex: 0.9 }}>
                    {emp.performance_rating ? (
                      <span style={{
                        backgroundColor: emp.performance_rating >= 4 ? '#4CAF50' : emp.performance_rating >= 3 ? '#2196F3' : '#FF9800',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}>
                        {emp.performance_rating}
                      </span>
                    ) : (
                      <span style={{ color: '#bbb' }}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={styles.info}>
            Showing {filtered.length} of {employees.length} · Click employee name to view appraisal
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
  },
  error: {
    padding: '12px',
    marginBottom: '16px',
    backgroundColor: '#fee',
    borderLeft: '4px solid #f44',
    borderRadius: '4px',
    color: '#c33',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  stat: {
    padding: '12px',
    borderRadius: '6px',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  number: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  label: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
    fontWeight: '500',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  search: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  clearButton: {
    padding: '10px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#999',
  },
  table: {
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  header: {
    display: 'flex',
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px 12px',
    fontWeight: 'bold',
    fontSize: '12px',
    gap: '8px',
  },
  row: {
    display: 'flex',
    padding: '10px 12px',
    borderBottom: '1px solid #eee',
    fontSize: '13px',
    gap: '8px',
    alignItems: 'center',
  },
  info: {
    marginTop: '12px',
    fontSize: '11px',
    color: '#999',
  },
};
