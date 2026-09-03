import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp } from 'lucide-react';

export default function KPITracker() {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: emps } = await supabase.from('employees').select('*');
        setEmployees(emps || []);
        if (emps && emps.length > 0) {
          setSelectedEmployee(emps[0].employee_id);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;

    const fetchKPIs = async () => {
      try {
        const { data } = await supabase
          .from('employee_kpis')
          .select('*, kpi_catalog(*)')
          .eq('employee_id', selectedEmployee);
        setKpiData(data || []);
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      }
    };

    fetchKPIs();
  }, [selectedEmployee]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Target': return '#28a745';
      case 'On Track': return '#17a2b8';
      case 'At Risk': return '#ffc107';
      case 'Critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (progress) => {
    if (progress >= 100) return 'On Target';
    if (progress >= 80) return 'On Track';
    if (progress >= 60) return 'At Risk';
    return 'Critical';
  };

  if (loading) {
    return <div style={{ color: '#666', padding: '16px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>KPI Tracker</h1>

      {/* Employee Selection */}
      <div style={{ marginBottom: '24px', background: 'white', padding: '16px', borderRadius: '4px', border: '1px solid #ddd' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Select Employee</label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
        >
          {employees.map(emp => (
            <option key={emp.employee_id} value={emp.employee_id}>
              {emp.full_name} - {emp.position}
            </option>
          ))}
        </select>
      </div>

      {/* KPI List */}
      {kpiData.length === 0 ? (
        <div style={{ background: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', padding: '16px', color: '#004085' }}>
          No KPIs assigned to this employee.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {kpiData.map(kpi => {
            const status = getStatusLabel(Math.random() * 100);
            const progress = Math.random() * 100;
            return (
              <div key={kpi.assignment_id} style={{ background: 'white', padding: '16px', borderRadius: '4px', border: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                      {kpi.kpi_catalog?.kpi_name}
                    </h2>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Weight: {kpi.weight}% | Target: {kpi.kpi_catalog?.target_value} {kpi.kpi_catalog?.unit}
                    </p>
                  </div>
                  <div style={{ background: getStatusColor(status), color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                    {status}
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '20px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      height: '100%',
                      background: getStatusColor(status),
                      transition: 'width 0.3s'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                  <span>Progress: {Math.round(progress)}%</span>
                  <span>Target: 100%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
