import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    completedAppraisals: 0,
    pendingAppraisals: 0,
    activePIPs: 0,
    pipStages: { written: 0, final: 0, pretermination: 0 },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: employees } = await supabase.from('employees').select('*');
        const { data: appraisals } = await supabase.from('appraisals').select('*');
        const { data: pips } = await supabase.from('pips').select('*');

        const completedCount = appraisals?.filter(a => a.status === 'submitted').length || 0;
        const pendingCount = appraisals?.filter(a => a.status === 'draft').length || 0;
        const pipStages = {
          written: pips?.filter(p => p.current_stage === 'Written Warning').length || 0,
          final: pips?.filter(p => p.current_stage === 'Final Warning').length || 0,
          pretermination: pips?.filter(p => p.current_stage === 'Pre-termination').length || 0,
        };

        setStats({
          totalEmployees: employees?.length || 0,
          completedAppraisals: completedCount,
          pendingAppraisals: pendingCount,
          activePIPs: pips?.length || 0,
          pipStages,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ color: '#666', padding: '16px' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
        Performance Management Dashboard
      </h1>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '4px', border: '1px solid #ddd' }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Total Employees</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>{stats.totalEmployees}</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '4px', border: '1px solid #ddd' }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Completed Appraisals</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{stats.completedAppraisals}</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '4px', border: '1px solid #ddd' }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Pending Appraisals</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>{stats.pendingAppraisals}</div>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '4px', border: '1px solid #ddd' }}>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>Active PIPs</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>{stats.activePIPs}</div>
        </div>
      </div>

      {/* PIP Distribution */}
      <div style={{ background: 'white', padding: '16px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Performance Improvement Plans by Stage</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>Written Warning</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{stats.pipStages.written}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>Final Warning</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{stats.pipStages.final}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>Pre-termination</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{stats.pipStages.pretermination}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      {stats.activePIPs > 0 && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px', padding: '12px', color: '#856404', display: 'flex', gap: '8px' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Active PIPs:</strong> {stats.activePIPs} employees are currently on performance improvement plans. Review their progress in the PIP Management tab.
          </div>
        </div>
      )}
    </div>
  );
}
