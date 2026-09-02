import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function PromotionEligibility({ userRole }) {
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromotionData();
  }, []);

  async function loadPromotionData() {
    try {
      // Get employees with ratings >= 3 in last 2 appraisals
      const { data: appraisals } = await supabase
        .from('appraisals')
        .select(`
          employee_id,
          overall_rating,
          appraisal_period,
          employee:employee_id(id, employee_id, full_name, position, sbu)
        `)
        .gte('overall_rating', 3)
        .order('created_at', { ascending: false });

      // Group by employee and count recent appraisals
      const employeeMap = {};
      appraisals?.forEach(a => {
        if (!employeeMap[a.employee_id]) {
          employeeMap[a.employee_id] = { employee: a.employee, ratings: [] };
        }
        employeeMap[a.employee_id].ratings.push(a.overall_rating);
      });

      // Filter those with at least 2 ratings
      const eligible = Object.values(employeeMap)
        .filter(e => e.ratings.length >= 2)
        .map(e => ({
          ...e.employee,
          recentRatings: e.ratings.slice(0, 2),
          avgRating: (e.ratings[0] + e.ratings[1]) / 2,
        }));

      setEligibleEmployees(eligible);

      // Load existing promotion records
      const { data: promoRecords } = await supabase
        .from('promotion_records')
        .select('*')
        .in('eligibility_status', ['recommended', 'approved']);

      setRecommendations(promoRecords || []);
    } catch (err) {
      console.error('Error loading promotion data:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Promotion Eligibility Tracking</h2>

      {loading && <div className="text-slate-500">Loading eligibility data...</div>}

      {!loading && (
        <>
          {/* Eligible Employees */}
          <div>
            <h3 className="font-medium text-slate-900 mb-4">Employees Meeting Eligibility Criteria</h3>
            <p className="text-sm text-slate-600 mb-4">Minimum: Overall rating ≥ 3 for last 2 appraisal periods</p>

            {eligibleEmployees.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-4 text-slate-600 text-sm">
                No employees currently meet promotion eligibility criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {eligibleEmployees.map((emp) => (
                  <div key={emp.id} className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-900">{emp.full_name}</p>
                        <p className="text-sm text-slate-600">{emp.position} · {emp.sbu}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-600">Average Rating</p>
                        <p className="text-xl font-bold text-green-600">{emp.avgRating.toFixed(1)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Last appraisal: {emp.recentRatings[0]}/5</span>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Prior: {emp.recentRatings[1]}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations Submitted */}
          <div>
            <h3 className="font-medium text-slate-900 mb-4">Submitted Recommendations</h3>
            {recommendations.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-4 text-slate-600 text-sm">
                No promotion recommendations submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-slate-900">Recommended for: {rec.target_position}</p>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        rec.eligibility_status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {rec.eligibility_status === 'approved' ? '✓ Approved' : 'Pending Review'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{rec.target_sbu}</p>
                    {rec.effective_date && (
                      <p className="text-sm text-slate-600">Effective: {new Date(rec.effective_date).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promotion Criteria Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-medium text-blue-900 mb-2">PGB Promotion Criteria</p>
            <ul className="text-sm text-blue-900 space-y-1">
              <li>✓ Overall rating ≥ 3 for at least 2 recent appraisal periods</li>
              <li>✓ Proficiency in required competencies exceeds current job level</li>
              <li>✓ Required training/certifications completed</li>
              <li>✓ Demonstrated personal motivation for new role</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
