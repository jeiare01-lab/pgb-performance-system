import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Target } from 'lucide-react';

export default function IDPPlanning() {
  const [loading, setLoading] = useState(true);
  const [idpData, setIdpData] = useState({
    highPotential: [],
    criticalRoleBackup: [],
    emergingLeader: [],
  });

  useEffect(() => {
    const fetchIDPData = async () => {
      try {
        const { data: idps } = await supabase.from('idps').select('*, employees(full_name, position, sbu)');

        if (!idps) {
          setLoading(false);
          return;
        }

        const categorized = {
          highPotential: idps.filter(i => i.tier === 'High Potential') || [],
          criticalRoleBackup: idps.filter(i => i.tier === 'Critical Role Backup') || [],
          emergingLeader: idps.filter(i => i.tier === 'Emerging Leader') || [],
        };

        setIdpData(categorized);
      } catch (error) {
        console.error('Error fetching IDP data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIDPData();
  }, []);

  const renderTierSection = (tier, data, icon) => (
    <div style={{ background: 'white', padding: '16px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {icon}
        <h2 style={{ fontSize: '16px', fontWeight: '600' }}>{tier} Pool</h2>
        <span style={{ background: '#e7f3ff', color: '#004085', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
          {data.length}
        </span>
      </div>

      {data.length === 0 ? (
        <p style={{ color: '#666', fontSize: '12px' }}>No employees in this tier.</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {data.map(emp => (
            <div key={emp.idp_id} style={{ background: '#f9f9f9', padding: '12px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {emp.employees?.full_name}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                {emp.employees?.position} | {emp.employees?.sbu}
              </div>
              {emp.development_goals && (
                <div style={{ fontSize: '12px', background: 'white', padding: '8px', borderRadius: '3px', borderLeft: '2px solid #007bff' }}>
                  <strong>Development Goals:</strong> {emp.development_goals}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div style={{ color: '#666', padding: '16px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Succession Pipeline & IDP Planning</h1>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', padding: '16px', color: '#004085' }}>
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>High Potential</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{idpData.highPotential.length}</div>
        </div>

        <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', padding: '16px', color: '#155724' }}>
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>Critical Role Backups</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{idpData.criticalRoleBackup.length}</div>
        </div>

        <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px', padding: '16px', color: '#856404' }}>
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>Emerging Leaders</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{idpData.emergingLeader.length}</div>
        </div>
      </div>

      {/* Info Box */}
      <div style={{ background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', padding: '16px', marginBottom: '24px', fontSize: '12px', color: '#666' }}>
        <strong>Succession Pipeline Tiers:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li><strong>High Potential:</strong> Next-generation leaders ready for promotion within 12-24 months</li>
          <li><strong>Critical Role Backup:</strong> Backup replacements for key positions in case of turnover</li>
          <li><strong>Emerging Leader:</strong> Early-career talent with significant long-term potential</li>
        </ul>
      </div>

      {/* Tier Sections */}
      {renderTierSection(
        'High Potential',
        idpData.highPotential,
        <Target size={20} color="#007bff" />
      )}

      {renderTierSection(
        'Critical Role Backup',
        idpData.criticalRoleBackup,
        <Users size={20} color="#28a745" />
      )}

      {renderTierSection(
        'Emerging Leader',
        idpData.emergingLeader,
        <Users size={20} color="#ffc107" />
      )}

      {/* IDP Process */}
      <div style={{ background: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', padding: '16px', fontSize: '12px', color: '#004085' }}>
        <strong>Individual Development Plan (IDP) Process:</strong>
        <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Identify high-potential and critical-role employees</li>
          <li>Conduct competency gap analysis vs. target role</li>
          <li>Develop 90-day action plan with clear milestones</li>
          <li>Assign executive coach or mentor</li>
          <li>Monthly progress reviews and adjustments</li>
          <li>Promotion or advancement when ready</li>
        </ol>
      </div>
    </div>
  );
}
