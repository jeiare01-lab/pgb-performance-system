import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

export default function KPITracker({ userRole }) {
  const [kpis, setKpis] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [period, setPeriod] = useState('FY2026_H2');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadKPIs(selectedEmployee);
    }
  }, [selectedEmployee, period]);

  async function loadEmployees() {
    try {
      const { data } = await supabase
        .from('employees')
        .select('id, employee_id, full_name')
        .eq('status', 'active')
        .order('full_name');
      setEmployees(data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  }

  async function loadKPIs(employeeId) {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('employee_kpis')
        .select(`
          id,
          target_value,
          kpi_id,
          kpi_catalog(code, name, rock_category, measurement_unit),
          kpi_tracking(tracking_date, actual_value, progress_percent, supervisor_notes)
        `)
        .eq('employee_id', employeeId)
        .eq('appraisal_period', period)
        .order('created_at');

      setKpis(data || []);
    } catch (err) {
      console.error('Error loading KPIs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addTracking(employeeKpiId, actualValue) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('kpi_tracking')
        .select('id')
        .eq('employee_kpi_id', employeeKpiId)
        .eq('tracking_date', today)
        .single();

      if (existing) {
        await supabase
          .from('kpi_tracking')
          .update({ actual_value: actualValue })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('kpi_tracking')
          .insert([{
            employee_kpi_id: employeeKpiId,
            tracking_date: today,
            actual_value: actualValue,
            progress_percent: (actualValue / (kpis.find(k => k.id === employeeKpiId)?.target_value || 1)) * 100
          }]);
      }

      loadKPIs(selectedEmployee);
    } catch (err) {
      console.error('Error adding tracking:', err);
    }
  }

  const getProgressStatus = (progress) => {
    if (progress >= 100) return { label: 'On Target', color: 'bg-green-100 text-green-900', barColor: 'bg-green-500' };
    if (progress >= 80) return { label: 'On Track', color: 'bg-blue-100 text-blue-900', barColor: 'bg-blue-500' };
    if (progress >= 60) return { label: 'At Risk', color: 'bg-yellow-100 text-yellow-900', barColor: 'bg-yellow-500' };
    return { label: 'Critical', color: 'bg-red-100 text-red-900', barColor: 'bg-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">KPI Tracking Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">Select an employee...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="FY2026_H1">FY 2026 - H1</option>
              <option value="FY2026_H2">FY 2026 - H2</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="text-slate-500">Loading KPIs...</div>}

      {!loading && kpis.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900">No KPIs assigned to this employee for this period.</p>
        </div>
      )}

      {!loading && kpis.length > 0 && (
        <div className="space-y-4">
          {kpis.map((kpi) => {
            const latestTracking = kpi.kpi_tracking && kpi.kpi_tracking.length > 0
              ? kpi.kpi_tracking[kpi.kpi_tracking.length - 1]
              : null;
            const progress = latestTracking?.progress_percent || 0;
            const status = getProgressStatus(progress);

            return (
              <div key={kpi.id} className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{kpi.kpi_catalog.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{kpi.kpi_catalog.rock_category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium text-slate-900">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${status.barColor}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Status */}
                {latestTracking && (
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded">
                    <div>
                      <p className="text-xs text-slate-600">Latest Update</p>
                      <p className="font-medium text-slate-900">{new Date(latestTracking.tracking_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Actual Value</p>
                      <p className="font-medium text-slate-900">{latestTracking.actual_value} {kpi.kpi_catalog.measurement_unit}</p>
                    </div>
                  </div>
                )}

                {/* Target */}
                <div className="text-sm text-slate-600 mb-4">
                  Target: <span className="font-medium">{kpi.target_value} {kpi.kpi_catalog.measurement_unit}</span>
                </div>

                {/* Quick Input */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Enter actual value"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTracking(kpi.id, parseFloat(e.target.value));
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      addTracking(kpi.id, parseFloat(input.value));
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Log
                  </button>
                </div>

                {/* History */}
                {kpi.kpi_tracking && kpi.kpi_tracking.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-600 mb-2">Recent Updates</p>
                    <div className="space-y-1 text-xs">
                      {kpi.kpi_tracking.slice(-3).reverse().map((track, idx) => (
                        <div key={idx} className="flex justify-between text-slate-600">
                          <span>{new Date(track.tracking_date).toLocaleDateString()}</span>
                          <span>{track.actual_value} {kpi.kpi_catalog.measurement_unit}</span>
                          <span className="text-slate-400">({Math.round(track.progress_percent)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
