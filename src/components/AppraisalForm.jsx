import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Save } from 'lucide-react';

export default function AppraisalForm() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    period: 'Q3 2024',
    kpiScores: {},
    competencyScores: {},
    valueScores: {},
  });
  const [kpis, setKpis] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [pgbValues, setValues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: emps } = await supabase.from('employees').select('*');
        const { data: kpiData } = await supabase.from('kpi_catalog').select('*');
        const { data: compData } = await supabase.from('competencies').select('*');
        const { data: valData } = await supabase.from('pgb_values').select('*');

        setEmployees(emps || []);
        setKpis(kpiData || []);
        setCompetencies(compData || []);
        setValues(valData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) {
      alert('Please select an employee');
      return;
    }

    try {
      const appraisalId = `appraisal-${Date.now()}`;
      const avgKpi = Object.values(formData.kpiScores).reduce((a, b) => a + b, 0) / Object.keys(formData.kpiScores).length || 0;
      const avgComp = Object.values(formData.competencyScores).reduce((a, b) => a + b, 0) / Object.keys(formData.competencyScores).length || 0;
      const avgVal = Object.values(formData.valueScores).reduce((a, b) => a + b, 0) / Object.keys(formData.valueScores).length || 0;
      const overallRating = (avgKpi * 0.5 + avgComp * 0.3 + avgVal * 0.2);

      await supabase.from('appraisals').insert([{
        appraisal_id: appraisalId,
        employee_id: formData.employeeId,
        period: formData.period,
        overall_rating: overallRating,
        status: 'submitted',
        submitted_date: new Date().toISOString().split('T')[0],
      }]);

      alert('Appraisal submitted successfully!');
      setFormData({ employeeId: '', period: 'Q3 2024', kpiScores: {}, competencyScores: {}, valueScores: {} });
    } catch (error) {
      console.error('Error submitting appraisal:', error);
      alert('Error submitting appraisal');
    }
  };

  if (loading) {
    return <div style={{ color: '#666', padding: '16px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Employee Appraisal Form</h1>

      <form onSubmit={handleSubmit}>
        {/* Employee Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Employee</label>
          <select
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          >
            <option value="">Select an employee</option>
            {employees.map(emp => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.full_name} ({emp.position})
              </option>
            ))}
          </select>
        </div>

        {/* Period */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Appraisal Period</label>
          <input
            type="text"
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          />
        </div>

        {/* KPI Ratings (50%) */}
        <div style={{ marginBottom: '24px', background: '#f9f9f9', padding: '16px', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>KPI Performance (50% weight)</h2>
          {kpis.map(kpi => (
            <div key={kpi.kpi_id} style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                {kpi.kpi_name}
              </label>
              <input
                type="number"
                min="1"
                max="5"
                placeholder="1-5"
                onChange={(e) => setFormData({
                  ...formData,
                  kpiScores: { ...formData.kpiScores, [kpi.kpi_id]: parseFloat(e.target.value) || 0 }
                })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          ))}
        </div>

        {/* Competency Ratings (30%) */}
        <div style={{ marginBottom: '24px', background: '#f9f9f9', padding: '16px', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Competency Assessment (30% weight)</h2>
          {competencies.map(comp => (
            <div key={comp.competency_id} style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                {comp.competency_name}
              </label>
              <input
                type="number"
                min="1"
                max="5"
                placeholder="1-5"
                onChange={(e) => setFormData({
                  ...formData,
                  competencyScores: { ...formData.competencyScores, [comp.competency_id]: parseFloat(e.target.value) || 0 }
                })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          ))}
        </div>

        {/* PGB Values Ratings (20%) */}
        <div style={{ marginBottom: '24px', background: '#f9f9f9', padding: '16px', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>PGB Values Alignment (20% weight)</h2>
          {pgbValues.map(val => (
            <div key={val.value_id} style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                {val.value_name}
              </label>
              <input
                type="number"
                min="1"
                max="5"
                placeholder="1-5"
                onChange={(e) => setFormData({
                  ...formData,
                  valueScores: { ...formData.valueScores, [val.value_id]: parseFloat(e.target.value) || 0 }
                })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Save size={18} />
          Submit Appraisal
        </button>
      </form>
    </div>
  );
}
