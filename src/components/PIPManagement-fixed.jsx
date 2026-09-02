import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Plus } from 'lucide-react';

export default function PIPManagement() {
  const [loading, setLoading] = useState(true);
  const [pips, setPips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: pipData } = await supabase.from('pips').select('*, employees(full_name, position)');
        const { data: empData } = await supabase.from('employees').select('*');

        setPips(pipData || []);
        setEmployees(empData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreatePIP = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      alert('Please select an employee');
      return;
    }

    try {
      const pipId = `pip-${Date.now()}`;
      await supabase.from('pips').insert([{
        pip_id: pipId,
        employee_id: formData.employeeId,
        start_date: formData.startDate,
        current_stage: 'Written Warning',
        created_by: 'HR System',
        created_date: new Date().toISOString().split('T')[0],
      }]);

      alert('PIP created successfully!');
      setShowForm(false);
      setFormData({ employeeId: '', startDate: new Date().toISOString().split('T')[0] });

      // Refresh list
      const { data: updatedPips } = await supabase.from('pips').select('*, employees(full_name, position)');
      setPips(updatedPips || []);
    } catch (error) {
      console.error('Error creating PIP:', error);
      alert('Error creating PIP');
    }
  };

  if (loading) {
    return <div style={{ color: '#666', padding: '16px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Performance Improvement Plans</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <Plus size={18} />
          New PIP
        </button>
      </div>

      {/* Create PIP Form */}
      {showForm && (
        <form onSubmit={handleCreatePIP} style={{ background: '#f9f9f9', padding: '16px', borderRadius: '4px', marginBottom: '24px', border: '1px solid #ddd' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Employee</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">Select an employee</option>
              {employees.map(emp => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} ({emp.position})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              style={{ flex: 1, padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Create PIP
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ flex: 1, padding: '8px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* PIP List */}
      {pips.length === 0 ? (
        <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', padding: '16px', color: '#155724' }}>
          No active PIPs at this time.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {pips.map(pip => (
            <div key={pip.pip_id} style={{ background: 'white', padding: '16px', borderRadius: '4px', border: '2px solid #dc3545' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                <AlertTriangle size={24} color="#dc3545" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {pip.employees?.full_name}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    {pip.employees?.position}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#666' }}>Stage:</span>
                      <div style={{ fontWeight: '600', color: '#dc3545' }}>{pip.current_stage}</div>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Start Date:</span>
                      <div style={{ fontWeight: '600' }}>{pip.start_date}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PIP Escalation Guide */}
      <div style={{ background: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', padding: '16px', marginTop: '24px', fontSize: '12px', color: '#004085' }}>
        <strong>PIP Escalation Timeline:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Week 2: Written Warning</li>
          <li>Week 4: Final Warning</li>
          <li>Week 6: Pre-termination</li>
          <li>Week 8: Termination (if goals not met)</li>
        </ul>
      </div>
    </div>
  );
}
