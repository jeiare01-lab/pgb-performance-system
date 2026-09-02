import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PromotionEligibility() {
  const [loading, setLoading] = useState(true);
  const [eligibleEmployees, setEligibleEmployees] = useState([]);

  useEffect(() => {
    const fetchEligibleEmployees = async () => {
      try {
        const { data: employees } = await supabase.from('employees').select('*');

        if (!employees) {
          setLoading(false);
          return;
        }

        const eligible = [];

        for (const emp of employees) {
          const { data: appraisals } = await supabase
            .from('appraisals')
            .select('*')
            .eq('employee_id', emp.employee_id)
            .order('submitted_date', { ascending: false })
            .limit(2);

          if (appraisals && appraisals.length >= 2) {
            const recentRatings = appraisals.slice(0, 2).map(a => a.overall_rating || 0);
            const avgRating = recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length;

            if (avgRating >= 3) {
              eligible.push({
                ...emp,
                avgRating: avgRating.toFixed(2),
                appraisalCount: appraisals.length,
                isEligible: true,
              });
            }
          }
        }

        setEligibleEmployees(eligible);
      } catch (error) {
        console.error('Error fetching eligible employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleEmployees();
  }, []);

  if (loading) {
    return <div style={{ color: '#666', padding: '16px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Promotion Eligibility</h1>

      <div style={{ background: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', padding: '16px', marginBottom: '24px', fontSize: '12px', color: '#004085' }}>
        <strong>Eligibility Criteria:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Overall rating ≥ 3.0 for 2+ consecutive appraisal periods</li>
          <li>Demonstrated competency proficiency in required areas</li>
          <li>Career path alignment and readiness</li>
        </ul>
      </div>

      {eligibleEmployees.length === 0 ? (
        <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px', padding: '16px', color: '#856404' }}>
          No employees currently meet promotion eligibility criteria.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {eligibleEmployees.map(emp => (
            <div key={emp.employee_id} style={{ background: 'white', padding: '16px', borderRadius: '4px', border: '1px solid #ddd' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                <CheckCircle size={24} color="#28a745" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {emp.full_name}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                    Current Position: {emp.position}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#666' }}>Average Rating</span>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#28a745' }}>
                        {emp.avgRating}/5
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Appraisals Completed</span>
                      <div style={{ fontSize: '18px', fontWeight: '600' }}>
                        {emp.appraisalCount}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Status</span>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>
                        ✓ Eligible
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Next Steps */}
      <div style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginTop: '24px', fontSize: '12px', color: '#666' }}>
        <strong>Next Steps for Eligible Employees:</strong>
        <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Confirm career path and target position alignment</li>
          <li>Complete competency gap analysis if needed</li>
          <li>Schedule promotion discussion with supervisor</li>
          <li>HR processes promotion submission by 15th of month</li>
          <li>Promotion effective on 22nd of month</li>
        </ol>
      </div>
    </div>
  );
}
