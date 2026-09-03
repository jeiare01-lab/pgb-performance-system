import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .order('last_name', { ascending: true });

      if (fetchError) {
        setError(`Supabase error: ${fetchError.message}`);
        setEmployees([]);
        return;
      }

      if (!data) {
        setError('No data returned from Supabase');
        setEmployees([]);
        return;
      }

      setEmployees(data);
    } catch (err) {
      setError(`Fetch error: ${err.message}`);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const searchStr = `${emp.first_name} ${emp.last_name} ${emp.employee_id} ${emp.role}`.toLowerCase();
    return searchStr.includes(filter.toLowerCase());
  });

  return (
    <div style={styles.container}>
      <h2>Dashboard</h2>

      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={styles.statsContainer}>
        <div style={styles.stat}>
          <div style={styles.statNumber}>{employees.length}</div>
          <div style={styles.statLabel}>Total Employees</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statNumber}>
            {employees.filter(e => e.performance_rating && e.performance_rating >= 4).length}
          </div>
          <div style={styles.statLabel}>High Performers (4-5)</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statNumber}>
            {employees.filter(e => !e.performance_rating).length}
          </div>
          <div style={styles.statLabel}>Pending Rating</div>
        </div>
      </div>

      <div style={styles.section}>
        <h3>Employee Roster</h3>
        <input
          type="text"
          placeholder="Search by name, ID, or role..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.searchInput}
        />
        
        {loading && <p>Loading employees...</p>}

        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div style={{ flex: 1 }}>Name</div>
            <div style={{ flex: 0.8 }}>Employee ID</div>
            <div style={{ flex: 1.2 }}>Role</div>
            <div style={{ flex: 0.6 }}>Grade</div>
            <div style={{ flex: 0.8 }}>Rating</div>
          </div>

          {filteredEmployees.length === 0 && !loading && (
            <p style={styles.emptyState}>
              {employees.length === 0
                ? 'No employees found. Check Supabase.'
                : 'No results match your search.'}
            </p>
          )}

          {filteredEmployees.map((emp) => (
            <div key={emp.id} style={styles.tableRow}>
              <div style={{ flex: 1 }}>
                {emp.first_name} {emp.last_name}
              </div>
              <div style={{ flex: 0.8 }}>{emp.employee_id}</div>
              <div style={{ flex: 1.2 }}>{emp.role}</div>
              <div style={{ flex: 0.6 }}>{emp.job_grade}</div>
              <div style={{ flex: 0.8 }}>
                {emp.performance_rating ? (
                  <span style={styles.ratingBadge}>{emp.performance_rating}</span>
                ) : (
                  <span style={styles.pendingBadge}>—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  error: {
    padding: '12px',
    marginBottom: '16px',
    backgroundColor: '#fee',
    borderLeft: '4px solid #f44',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#c33',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  stat: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '8px',
  },
  section: {
    marginTop: '24px',
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    marginBottom: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  table: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    backgroundColor: '#333',
    color: '#fff',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '14px',
    gap: '12px',
  },
  tableRow: {
    display: 'flex',
    padding: '12px',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
    gap: '12px',
    alignItems: 'center',
  },
  emptyState: {
    padding: '20px',
    textAlign: 'center',
    color: '#999',
  },
  ratingBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  pendingBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#ccc',
    color: '#666',
    borderRadius: '4px',
    fontSize: '12px',
  },
};
