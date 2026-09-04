import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      
      const { data, error: err } = await supabase
        .from('employees')
        .select('employee_id, first_name, last_name, role, job_grade, performance_rating');

      if (err) {
        setError(err.message);
        return;
      }

      setEmployees(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>

      {error && <p style={{ color: '#c33', padding: '12px', backgroundColor: '#fee', borderRadius: '4px' }}>Error: {error}</p>}

      {loading && <p>Loading...</p>}

      {!loading && employees.length === 0 && !error && <p>No employees found.</p>}

      {!loading && employees.length > 0 && (
        <div>
          <p><strong>Total: {employees.length} employees</strong></p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr style={{ backgroundColor: '#333', color: '#fff' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {employees.slice(0, 50).map((emp, idx) => (
                <tr key={emp.employee_id} style={{ backgroundColor: idx % 2 === 0 ? '#f9f9f9' : '#fff', borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>{emp.first_name} {emp.last_name}</td>
                  <td style={{ padding: '8px' }}>{emp.employee_id}</td>
                  <td style={{ padding: '8px' }}>{emp.role}</td>
                  <td style={{ padding: '8px' }}>{emp.job_grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>Showing first 50 of {employees.length}</p>
        </div>
      )}
    </div>
  );
}
