import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError('');

      const { data, error: err } = await supabase
        .from('employees')
        .select('employee_id, first_name, last_name, role, job_grade, performance_rating')
        .order('first_name');

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

  const filtered = employees.filter(e => {
    const search = `${e.first_name} ${e.last_name} ${e.employee_id} ${e.role}`.toLowerCase();
    return search.includes(filter.toLowerCase());
  });

  return (
    <div style={styles.container}>
      <h2>Dashboard</h2>

      {error && (
        <div style={styles.error}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.number}>{employees.length}</div>
          <div style={styles.label}>Total Employees</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.number}>{employees.filter(e => e.performance_rating >= 4).length}</div>
          <div style={styles.label}>High Performers</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.number}>{employees.filter(e => !e.performance_rating).length}</div>
          <div style={styles.label}>Pending Rating</div>
        </div>
      </div>

      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Search by name, ID, or role..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.search}
          />

          {filtered.length === 0 ? (
            <p>No employees found.</p>
          ) : (
            <div style={styles.table}>
              <div style={styles.header}>
                <div style={{ flex: 1.2 }}>Name</div>
                <div style={{ flex: 0.8 }}>Employee ID</div>
                <div style={{ flex: 1.5 }}>Role</div>
                <div style={{ flex: 0.6 }}>Grade</div>
                <div style={{ flex: 0.6 }}>Rating</div>
              </div>
              {filtered.map((emp) => (
                <div key={emp.employee_id} style={styles.row}>
                  <div style={{ flex: 1.2 }}>{emp.first_name} {emp.last_name}</div>
                  <div style={{ flex: 0.8 }}>{emp.employee_id}</div>
                  <div style={{ flex: 1.5, fontSize: '13px' }}>{emp.role}</div>
                  <div style={{ flex: 0.6 }}>{emp.job_grade}</div>
                  <div style={{ flex: 0.6 }}>
                    {emp.performance_rating ? (
                      <span style={{ backgroundColor: '#4CAF50', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>
                        {emp.performance_rating}
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
            Showing {filtered.length} of {employees.length}
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  stat: {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    textAlign: 'center',
  },
  number: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  label: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
  },
  search: {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
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
    fontSize: '13px',
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
};
