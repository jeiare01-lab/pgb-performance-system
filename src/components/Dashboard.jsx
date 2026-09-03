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
        .select('employee_id, first_name, last_name, email, company_id, role, job_grade, department, performance_rating')
        .order('first_name', { ascending: true });

      if (fetchError) {
        setError(`${fetchError.message}`);
        console.error('Fetch error:', fetchError);
        return;
      }

      if (!data) {
        setError('No data returned');
        return;
      }

      setEmployees(data);
    } catch (err) {
      setError(`${err.message}`);
      console.error('Catch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const searchStr = `${emp.first_name || ''} ${emp.last_name || ''} ${emp.employee_id || ''} ${emp.role || ''}`.toLowerCase();
    return searchStr.includes(filter.toLowerCase());
  });

  const highPerformers = employees.filter(e => e.performance_rating && e.performance_rating >= 4).length;
  const pendingRatings = employees.filter(e => !e.performance_rating).length;

  return (
    <div style={styles.container}>
      <h2>Dashboard</h2>

      {error && (
        <div style={styles.error}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      <div style={styles.statsContainer}>
        <div style={styles.stat}>
          <div style={styles.statNumber}>{employees.length}</div>
          <div style={styles.statLabel}>Total Employees</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statNumber}>{highPerformers}</div>
          <div style={styles.statLabel}>High Performers (4-5)</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statNumber}>{pendingRatings}</div>
          <div style={styles.statLabel}>Pending Rating</div>
        </div>
      </div>

      <div style={styles.section}>
        <h3>Employee Roster</h3>
        
        {loading ? (
          <p style={styles.loadingState}>Loading employees...</p>
        ) : (
          <>
            <input
              type="text"
              placeholder="Search by name, ID, or role..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={styles.searchInput}
            />

            {filteredEmployees.length === 0 ? (
              <p style={styles.emptyState}>
                {employees.length === 0
                  ? 'No employees found in database.'
                  : 'No results match your search.'}
              </p>
            ) : (
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <div style={{ flex: 1.2 }}>Name</div>
                  <div style={{ flex: 0.9 }}>Employee ID</div>
                  <div style={{ flex: 1.5 }}>Role</div>
                  <div style={{ flex: 0.6 }}>Grade</div>
                  <div style={{ flex: 0.8 }}>Rating</div>
                </div>

                {filteredEmployees.map((emp) => (
                  <div key={emp.employee_id} style={styles.tableRow}>
                    <div style={{ flex: 1.2 }}>
                      {emp.first_name} {emp.last_name}
                    </div>
                    <div style={{ flex: 0.9 }}>{emp.employee_id}</div>
                    <div style={{ flex: 1.5, fontSize: '13px' }}>{emp.role}</div>
                    <div style={{ flex: 0.6, textAlign: 'center' }}>{emp.job_grade}</div>
                    <div style={{ flex: 0.8 }}>
                      {emp.performance_rating ? (
                        <span style={{
                          ...styles.ratingBadge,
                          backgroundColor: emp.performance_rating >= 4 ? '#4CAF50' : emp.performance_rating >= 3 ? '#2196F3' : '#FF9800'
                        }}>
                          {emp.performance_rating}
                        </span>
                      ) : (
                        <span style={styles.pendingBadge}>—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  error: {
    padding: '12px 16px',
    marginBottom: '20px',
    backgroundColor: '#fee',
    borderLeft: '4px solid #f44',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#c33',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  stat: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e0e0e0',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '8px',
    fontWeight: '500',
  },
  section: {
    marginTop: '24px',
  },
  loadingState: {
    padding: '20px',
    textAlign: 'center',
    color: '#999',
  },
  searchInput: {
    width: '100%',
    padding: '12px',
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
    backgroundColor: '#fff',
  },
  tableHeader: {
    display: 'flex',
    backgroundColor: '#333',
    color: '#fff',
    padding: '12px',
    fontWeight: '600',
    fontSize: '13px',
    gap: '12px',
    borderBottom: '2px solid #222',
  },
  tableRow: {
    display: 'flex',
    padding: '12px',
    borderBottom: '1px solid #eee',
    fontSize: '13px',
    gap: '12px',
    alignItems: 'center',
  },
  emptyState: {
    padding: '32px',
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
  },
  ratingBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    color: '#fff',
    borderRadius: '3px',
    fontSize: '12px',
    fontWeight: '600',
  },
  pendingBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#e0e0e0',
    color: '#666',
    borderRadius: '3px',
    fontSize: '12px',
  },
};
