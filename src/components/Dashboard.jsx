import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState('checking');

  useEffect(() => {
    checkSupabase();
  }, []);

  async function checkSupabase() {
    try {
      console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

      if (!import.meta.env.VITE_SUPABASE_URL) {
        setSupabaseStatus('missing-url');
        setError('Missing VITE_SUPABASE_URL');
        return;
      }

      if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setSupabaseStatus('missing-key');
        setError('Missing VITE_SUPABASE_ANON_KEY');
        return;
      }

      // Try to import Supabase
      const { supabase } = await import('../lib/supabase');
      
      if (!supabase) {
        setSupabaseStatus('init-failed');
        setError('Supabase client failed to initialize');
        return;
      }

      setSupabaseStatus('ready');
      loadEmployees();
    } catch (e) {
      setSupabaseStatus('error');
      setError(`Init error: ${e.message}`);
    }
  }

  async function loadEmployees() {
    try {
      setLoading(true);
      setError('');
      
      const { supabase } = await import('../lib/supabase');

      const { data, error: err } = await supabase
        .from('employees')
        .select('employee_id, first_name, last_name, role, job_grade, performance_rating')
        .limit(100);

      if (err) {
        setError(`Query error: ${err.message}`);
        return;
      }

      if (!data) {
        setError('No data returned (data is null)');
        return;
      }

      setEmployees(data);
    } catch (e) {
      setError(`Catch error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>

      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p><strong>Supabase Status:</strong> {supabaseStatus}</p>
        {error && <p style={{ color: '#c33', margin: '8px 0' }}>⚠️ {error}</p>}
      </div>

      {supabaseStatus === 'ready' && (
        <button
          onClick={loadEmployees}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#ccc' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
          }}
        >
          {loading ? 'Loading...' : 'Load Employees'}
        </button>
      )}

      {employees.length > 0 && (
        <div>
          <p><strong>Total: {employees.length} employees</strong></p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', fontSize: '13px' }}>
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
                  <td style={{ padding: '8px', fontSize: '12px' }}>{emp.role}</td>
                  <td style={{ padding: '8px' }}>{emp.job_grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
