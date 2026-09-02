import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Calendar, Users } from 'lucide-react';

export default function PIPManagement({ userRole }) {
  const [pips, setPips] = useState([]);
  const [selectedPip, setSelectedPip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNewPip, setShowNewPip] = useState(false);
  const [newPipData, setNewPipData] = useState({
    employee_id: '',
    reason_text: '',
    performance_objectives: '',
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadPips();
    loadEmployees();
  }, []);

  async function loadPips() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('pips')
        .select(`
          *,
          employee:employee_id(employee_id, full_name),
          pip_tracking(week_number, check_in_date, performance_status, escalation_status)
        `)
        .order('created_at', { ascending: false });
      setPips(data || []);
    } catch (err) {
      console.error('Error loading PIPs:', err);
    } finally {
      setLoading(false);
    }
  }

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

  async function createPip() {
    if (!newPipData.employee_id || !newPipData.reason_text) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 8 weeks

      const { data } = await supabase
        .from('pips')
        .insert([{
          employee_id: newPipData.employee_id,
          initiated_by_id: userData.user.id,
          reason_text: newPipData.reason_text,
          performance_objectives: newPipData.performance_objectives,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          current_week: 1,
          current_sanction: null,
        }])
        .select();

      // Create initial tracking record
      if (data && data.length > 0) {
        await supabase
          .from('pip_tracking')
          .insert([{
            pip_id: data[0].id,
            week_number: 1,
            check_in_date: startDate,
            performance_status: 'off_track',
          }]);
      }

      setNewPipData({ employee_id: '', reason_text: '', performance_objectives: '' });
      setShowNewPip(false);
      loadPips();
    } catch (err) {
      console.error('Error creating PIP:', err);
      alert('Error creating PIP');
    }
  }

  async function logWeeklyCheckIn(pipId, weekNumber, status, goalsmet) {
    try {
      const checkInDate = new Date().toISOString().split('T')[0];

      // Determine escalation based on performance and week
      let escalation = null;
      if (status === 'off_track') {
        if (weekNumber === 2) escalation = 'written_warning';
        else if (weekNumber === 4) escalation = 'final_warning';
        else if (weekNumber === 6) escalation = 'pre_termination';
        else if (weekNumber >= 8) escalation = 'termination';
      }

      const { data: existingCheck } = await supabase
        .from('pip_tracking')
        .select('id')
        .eq('pip_id', pipId)
        .eq('week_number', weekNumber)
        .single();

      if (existingCheck) {
        await supabase
          .from('pip_tracking')
          .update({
            performance_status: status,
            goals_met: goalsmet,
            escalation_status: escalation,
          })
          .eq('id', existingCheck.id);
      } else {
        await supabase
          .from('pip_tracking')
          .insert([{
            pip_id: pipId,
            week_number: weekNumber,
            check_in_date: checkInDate,
            performance_status: status,
            goals_met: goalsmet,
            escalation_status: escalation,
          }]);
      }

      // Update PIP current status
      const sanctionMap = {
        'written_warning': 'Written Warning',
        'final_warning': 'Final Warning',
        'pre_termination': 'Pre-termination',
        'termination': 'Termination',
      };

      if (escalation) {
        await supabase
          .from('pips')
          .update({
            current_week: weekNumber,
            current_sanction: sanctionMap[escalation],
          })
          .eq('id', pipId);
      }

      loadPips();
    } catch (err) {
      console.error('Error logging check-in:', err);
    }
  }

  const getSanctionColor = (sanction) => {
    if (!sanction) return 'bg-blue-50 text-blue-900';
    if (sanction === 'Written Warning') return 'bg-yellow-50 text-yellow-900';
    if (sanction === 'Final Warning') return 'bg-orange-50 text-orange-900';
    if (sanction.includes('Pre-termination')) return 'bg-red-50 text-red-900';
    return 'bg-red-100 text-red-900';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900">Performance Improvement Plans</h2>
        {userRole !== 'executive' && (
          <button
            onClick={() => setShowNewPip(!showNewPip)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            {showNewPip ? 'Cancel' : '+ New PIP'}
          </button>
        )}
      </div>

      {/* New PIP Form */}
      {showNewPip && userRole !== 'executive' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Initiate Performance Improvement Plan</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Employee</label>
              <select
                value={newPipData.employee_id}
                onChange={(e) => setNewPipData({ ...newPipData, employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">Select an employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason for PIP</label>
              <textarea
                value={newPipData.reason_text}
                onChange={(e) => setNewPipData({ ...newPipData, reason_text: e.target.value })}
                placeholder="Describe performance deficiencies and previous coaching/discussions"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Performance Objectives (What needs to improve)</label>
              <textarea
                value={newPipData.performance_objectives}
                onChange={(e) => setNewPipData({ ...newPipData, performance_objectives: e.target.value })}
                placeholder="Specific, measurable, achievable outcomes"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={createPip}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create PIP
              </button>
              <button
                onClick={() => setShowNewPip(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIPs List */}
      {loading && <div className="text-slate-500">Loading PIPs...</div>}

      {!loading && pips.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900">No active Performance Improvement Plans.</p>
        </div>
      )}

      {!loading && pips.length > 0 && (
        <div className="space-y-4">
          {pips.map((pip) => (
            <div key={pip.id} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{pip.employee.full_name}</h3>
                  <p className="text-sm text-slate-600">Employee ID: {pip.employee.employee_id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSanctionColor(pip.current_sanction)}`}>
                  {pip.current_sanction || 'Week ' + pip.current_week}
                </span>
              </div>

              <div className="mb-4 p-3 bg-slate-50 rounded">
                <p className="text-sm font-medium text-slate-900 mb-1">Reason</p>
                <p className="text-sm text-slate-600">{pip.reason_text}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-slate-900 mb-1">Objectives to Achieve</p>
                <p className="text-sm text-slate-600">{pip.performance_objectives}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-slate-600">Started</p>
                  <p className="font-medium text-slate-900">{new Date(pip.start_date).toLocaleDateString()}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-slate-600">Due</p>
                  <p className="font-medium text-slate-900">{new Date(pip.end_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Weekly Check-in */}
              {pip.status === 'active' && (
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm font-medium text-slate-900 mb-3">Week {pip.current_week + 1} Check-in</p>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => logWeeklyCheckIn(pip.id, pip.current_week + 1, 'on_track', true)}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-900 rounded hover:bg-green-200 text-sm font-medium"
                    >
                      ✓ On Track & Goals Met
                    </button>
                    <button
                      onClick={() => logWeeklyCheckIn(pip.id, pip.current_week + 1, 'off_track', false)}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-900 rounded hover:bg-red-200 text-sm font-medium"
                    >
                      ✗ Off Track
                    </button>
                  </div>
                </div>
              )}

              {/* PIP Tracking History */}
              {pip.pip_tracking && pip.pip_tracking.length > 0 && (
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <p className="text-xs font-medium text-slate-600 mb-2">Progress Timeline</p>
                  <div className="space-y-1 text-xs">
                    {pip.pip_tracking.map((track) => (
                      <div key={track.week_number} className="flex justify-between p-1 bg-slate-50 rounded">
                        <span>Week {track.week_number}</span>
                        <span className={`font-medium ${track.performance_status === 'on_track' ? 'text-green-600' : 'text-red-600'}`}>
                          {track.performance_status === 'on_track' ? '✓ On Track' : '✗ Off Track'}
                        </span>
                        <span className="text-slate-500">{new Date(track.check_in_date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
