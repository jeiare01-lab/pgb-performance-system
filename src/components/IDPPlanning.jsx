import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Target, AlertCircle } from 'lucide-react';

export default function IDPPlanning({ userRole }) {
  const [idps, setIdps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successors, setSuccessors] = useState({
    high_potential: [],
    critical_role_backup: [],
    emerging_leader: [],
  });

  useEffect(() => {
    loadIDPData();
  }, []);

  async function loadIDPData() {
    try {
      const { data } = await supabase
        .from('idps')
        .select(`
          *,
          employee:employee_id(id, employee_id, full_name, position, sbu),
          mentor:mentor_id(full_name),
          coach:coach_assigned_id(full_name)
        `)
        .eq('status', 'active')
        .order('succession_level');

      if (data) {
        setIdps(data);

        // Group by succession level
        const grouped = {
          high_potential: data.filter(d => d.succession_level === 'high_potential'),
          critical_role_backup: data.filter(d => d.succession_level === 'critical_role_backup'),
          emerging_leader: data.filter(d => d.succession_level === 'emerging_leader'),
        };
        setSuccessors(grouped);
      }
    } catch (err) {
      console.error('Error loading IDP data:', err);
    } finally {
      setLoading(false);
    }
  }

  const LevelCard = ({ level, title, color, successorList }) => (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className={`font-semibold text-slate-900 mb-1 flex items-center gap-2`}>
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        {title}
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        {successorList.length} {successorList.length === 1 ? 'person' : 'people'}
      </p>

      {successorList.length === 0 ? (
        <div className="text-sm text-slate-500 italic">None assigned</div>
      ) : (
        <div className="space-y-3">
          {successorList.map((successor) => (
            <div key={successor.id} className={`p-3 rounded ${color === 'bg-red-400' ? 'bg-red-50' : color === 'bg-yellow-400' ? 'bg-yellow-50' : 'bg-green-50'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{successor.employee.full_name}</p>
                  <p className="text-xs text-slate-600">{successor.employee.position} · {successor.employee.sbu}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-700"><span className="font-medium">Target:</span> {successor.target_position}</p>
                <p className="text-slate-700"><span className="font-medium">Timeline:</span> {successor.target_timeline_years} years</p>
                {successor.mentor && <p className="text-slate-700"><span className="font-medium">Mentor:</span> {successor.mentor.full_name}</p>}
                {successor.coach && <p className="text-slate-700"><span className="font-medium">Coach:</span> {successor.coach.full_name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">IDP & Succession Planning</h2>
        <p className="text-sm text-slate-600">Individual Development Plans for succession pipeline</p>
      </div>

      {loading && <div className="text-slate-500">Loading IDP data...</div>}

      {!loading && (
        <>
          {/* Succession Levels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <LevelCard
              level="high_potential"
              title="High Potential Successors"
              color="bg-red-400"
              successorList={successors.high_potential}
            />
            <LevelCard
              level="critical_role_backup"
              title="Critical Role Backups"
              color="bg-yellow-400"
              successorList={successors.critical_role_backup}
            />
            <LevelCard
              level="emerging_leader"
              title="Emerging Leaders"
              color="bg-green-400"
              successorList={successors.emerging_leader}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Total in Pipeline</p>
              <p className="text-3xl font-bold text-slate-900">{idps.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Average Timeline</p>
              <p className="text-3xl font-bold text-slate-900">
                {idps.length > 0 ? Math.round(idps.reduce((sum, i) => sum + (i.target_timeline_years || 0), 0) / idps.length) : 0} yrs
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">With Assigned Coach</p>
              <p className="text-3xl font-bold text-slate-900">{idps.filter(i => i.coach_assigned_id).length}</p>
            </div>
          </div>

          {/* Recent IDP Activity */}
          {idps.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Recent Development Activities</h3>
              <div className="space-y-3">
                {idps.slice(0, 5).map((idp) => (
                  <div key={idp.id} className="flex justify-between items-start pb-3 border-b border-slate-200 last:border-b-0">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{idp.employee.full_name}</p>
                      <p className="text-xs text-slate-600">{idp.target_position} | {idp.target_timeline_years}-year plan</p>
                    </div>
                    {idp.quarterly_review_date && (
                      <span className="text-xs text-slate-600">Review: {new Date(idp.quarterly_review_date).toLocaleDateString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competency Gap Analysis */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2 mb-2">
              <AlertCircle size={18} className="text-blue-600 flex-shrink-0" />
              <p className="font-medium text-blue-900">IDP Insights</p>
            </div>
            <ul className="text-sm text-blue-900 space-y-1 ml-6">
              <li>• Quarterly review dates help track development progress</li>
              <li>• Assigned coaches provide structured mentorship</li>
              <li>• Link IDPs to appraisal competency ratings for alignment</li>
              <li>• Succession plan readiness improved through consistent development</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
