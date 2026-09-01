import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, AlertCircle, Check } from 'lucide-react';

export default function AppraisalForm({ userRole }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [appraisalPeriod, setAppraisalPeriod] = useState('FY2026_H2');
  const [appraisalData, setAppraisalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const { data } = await supabase
        .from('employees')
        .select('id, employee_id, full_name, position')
        .eq('status', 'active')
        .order('full_name');
      setEmployees(data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  }

  async function loadAppraisal(employeeId) {
    if (!employeeId) return;
    setLoading(true);
    try {
      // Load existing appraisal or create new one
      let { data: appraisal } = await supabase
        .from('appraisals')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('appraisal_period', appraisalPeriod)
        .single();

      if (!appraisal) {
        // Create new appraisal
        const { data: newAppraisal } = await supabase
          .from('appraisals')
          .insert([{ employee_id: employeeId, appraisal_period: appraisalPeriod, status: 'draft' }])
          .select()
          .single();
        appraisal = newAppraisal;
      }

      // Load KPIs, Competencies, and Values
      const { data: kpis } = await supabase
        .from('employee_kpis')
        .select('*, kpi_catalog(code, name, rock_category)')
        .eq('employee_id', employeeId)
        .eq('appraisal_period', appraisalPeriod);

      const { data: competencies } = await supabase
        .from('competencies')
        .select('*')
        .order('name');

      const { data: values } = await supabase
        .from('pgb_values')
        .select('*')
        .order('filipinized_name');

      // Load existing ratings
      const { data: kpiRatings } = await supabase
        .from('appraisal_kpi_ratings')
        .select('*')
        .eq('appraisal_id', appraisal.id);

      const { data: compRatings } = await supabase
        .from('appraisal_competency_ratings')
        .select('*')
        .eq('appraisal_id', appraisal.id);

      const { data: valRatings } = await supabase
        .from('appraisal_value_ratings')
        .select('*')
        .eq('appraisal_id', appraisal.id);

      setAppraisalData({
        appraisal,
        kpis: kpis || [],
        competencies: competencies || [],
        values: values || [],
        kpiRatings: kpiRatings || [],
        compRatings: compRatings || [],
        valRatings: valRatings || [],
      });
    } catch (err) {
      console.error('Error loading appraisal:', err);
      setMessage('Error loading appraisal');
    } finally {
      setLoading(false);
    }
  }

  async function updateKPIRating(kpiId, rating, evidence) {
    if (!appraisalData) return;
    const existing = appraisalData.kpiRatings.find(r => r.kpi_id === kpiId);
    if (existing) {
      await supabase
        .from('appraisal_kpi_ratings')
        .update({ rating, evidence })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('appraisal_kpi_ratings')
        .insert([{ appraisal_id: appraisalData.appraisal.id, kpi_id, rating, evidence }]);
    }
  }

  async function calculateWeightedScore() {
    if (!appraisalData) return;
    const kpiAvg = appraisalData.kpiRatings.length > 0
      ? appraisalData.kpiRatings.reduce((sum, r) => sum + r.rating, 0) / appraisalData.kpiRatings.length
      : 0;
    const compAvg = appraisalData.compRatings.length > 0
      ? appraisalData.compRatings.reduce((sum, r) => sum + r.rating, 0) / appraisalData.compRatings.length
      : 0;
    const valAvg = appraisalData.valRatings.length > 0
      ? appraisalData.valRatings.reduce((sum, r) => sum + r.rating, 0) / appraisalData.valRatings.length
      : 0;

    const weighted = (kpiAvg * 0.5) + (compAvg * 0.3) + (valAvg * 0.2);
    return Math.round(weighted * 10) / 10;
  }

  async function saveAppraisal() {
    if (!appraisalData || !selectedEmployee) {
      setMessage('Please select an employee');
      return;
    }
    setSaving(true);
    try {
      const overallRating = calculateWeightedScore();
      await supabase
        .from('appraisals')
        .update({
          overall_rating: overallRating,
          status: 'submitted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appraisalData.appraisal.id);
      setMessage('✓ Appraisal saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving appraisal:', err);
      setMessage('Error saving appraisal');
    } finally {
      setSaving(false);
    }
  }

  const ratingScale = [
    { value: 1, label: '1 - Unsatisfactory' },
    { value: 2, label: '2 - Needs Improvement' },
    { value: 3, label: '3 - Meets Expectation' },
    { value: 4, label: '4 - Exceeds Expectation' },
    { value: 5, label: '5 - Outstanding' },
  ];

  if (!appraisalData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Performance Appraisal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => {
                  setSelectedEmployee(e.target.value);
                  loadAppraisal(e.target.value);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Appraisal Period</label>
              <select
                value={appraisalPeriod}
                onChange={(e) => setAppraisalPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="FY2026_H1">FY 2026 - H1</option>
                <option value="FY2026_H2">FY 2026 - H2</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overallRating = calculateWeightedScore();

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✓') ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-600">Employee</p>
            <p className="font-semibold">{selectedEmployee ? employees.find(e => e.id === selectedEmployee)?.full_name : ''}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Period</p>
            <p className="font-semibold">{appraisalPeriod.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Status</p>
            <p className="font-semibold capitalize">{appraisalData.appraisal.status}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Overall Rating (Calculated)</p>
            <p className="font-semibold text-lg text-blue-600">{overallRating} / 5</p>
          </div>
        </div>
      </div>

      {/* KPIs Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">I. Key Performance Indicators (50% weight)</h3>
        {appraisalData.kpis.length > 0 ? (
          <div className="space-y-4">
            {appraisalData.kpis.map((kpi) => {
              const rating = appraisalData.kpiRatings.find(r => r.kpi_id === kpi.id);
              return (
                <div key={kpi.id} className="border-l-4 border-blue-400 pl-4 pb-4">
                  <p className="font-medium text-slate-900">{kpi.kpi_catalog.name}</p>
                  <p className="text-sm text-slate-600 mb-3">{kpi.kpi_catalog.rock_category}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Rating</label>
                      <select
                        value={rating?.rating || ''}
                        onChange={(e) => updateKPIRating(kpi.id, parseInt(e.target.value), rating?.evidence || '')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      >
                        <option value="">Select...</option>
                        {ratingScale.map(scale => (
                          <option key={scale.value} value={scale.value}>{scale.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Evidence/Result</label>
                      <input
                        type="text"
                        placeholder="e.g., 92% of target"
                        value={rating?.evidence || ''}
                        onChange={(e) => updateKPIRating(kpi.id, rating?.rating || 3, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-500">No KPIs assigned to this employee for this period.</p>
        )}
      </div>

      {/* Competencies Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">II. Competencies (30% weight)</h3>
        <div className="space-y-4">
          {appraisalData.competencies.map((comp) => {
            const rating = appraisalData.compRatings.find(r => r.competency_id === comp.id);
            return (
              <div key={comp.id} className="border-l-4 border-green-400 pl-4 pb-4">
                <p className="font-medium text-slate-900">{comp.name}</p>
                <p className="text-sm text-slate-600 mb-3">{comp.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Rating</label>
                    <select
                      value={rating?.rating || ''}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value);
                        if (rating) {
                          supabase.from('appraisal_competency_ratings').update({ rating: newVal }).eq('id', rating.id);
                        } else {
                          supabase.from('appraisal_competency_ratings').insert([{
                            appraisal_id: appraisalData.appraisal.id,
                            competency_id: comp.id,
                            rating: newVal
                          }]);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Select...</option>
                      {ratingScale.map(scale => (
                        <option key={scale.value} value={scale.value}>{scale.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Observed Behavior</label>
                    <input
                      type="text"
                      placeholder="Examples observed"
                      value={rating?.observed_behavior || ''}
                      onChange={(e) => {
                        if (rating) {
                          supabase.from('appraisal_competency_ratings').update({ observed_behavior: e.target.value }).eq('id', rating.id);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">III. Personal Attributes (20% weight)</h3>
        <div className="space-y-4">
          {appraisalData.values.map((val) => {
            const rating = appraisalData.valRatings.find(r => r.value_id === val.id);
            return (
              <div key={val.id} className="border-l-4 border-purple-400 pl-4 pb-4">
                <p className="font-medium text-slate-900">{val.filipinized_name} - {val.english_name}</p>
                <p className="text-sm text-slate-600 mb-3">{val.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Rating</label>
                    <select
                      value={rating?.rating || ''}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value);
                        if (rating) {
                          supabase.from('appraisal_value_ratings').update({ rating: newVal }).eq('id', rating.id);
                        } else {
                          supabase.from('appraisal_value_ratings').insert([{
                            appraisal_id: appraisalData.appraisal.id,
                            value_id: val.id,
                            rating: newVal
                          }]);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Select...</option>
                      {ratingScale.map(scale => (
                        <option key={scale.value} value={scale.value}>{scale.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Example / Evidence</label>
                    <input
                      type="text"
                      placeholder="Specific example"
                      value={rating?.example_evidence || ''}
                      onChange={(e) => {
                        if (rating) {
                          supabase.from('appraisal_value_ratings').update({ example_evidence: e.target.value }).eq('id', rating.id);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={saveAppraisal}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Appraisal'}
        </button>
      </div>
    </div>
  );
}
