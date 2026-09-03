import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AppraisalForm from './components/AppraisalForm';
import KPITracker from './components/KPITracker';
import PIPManagement from './components/PIPManagement';
import PromotionEligibility from './components/PromotionEligibility';
import IDPPlanning from './components/IDPPlanning';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: '#333', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>PGB Performance Management System</h1>
        <div style={{ fontSize: '12px', color: '#ccc' }}>Demo Mode</div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '2px solid #ddd' }}>
        <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'appraisal', label: 'Appraisal Form' },
            { id: 'kpi', label: 'KPI Tracker' },
            { id: 'pip', label: 'PIP Management' },
            { id: 'promotion', label: 'Promotion Eligibility' },
            { id: 'idp', label: 'Succession Planning' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                background: activeTab === tab.id ? '#007bff' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', background: '#f5f5f5', minHeight: 'calc(100vh - 120px)' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'appraisal' && <AppraisalForm />}
        {activeTab === 'kpi' && <KPITracker />}
        {activeTab === 'pip' && <PIPManagement />}
        {activeTab === 'promotion' && <PromotionEligibility />}
        {activeTab === 'idp' && <IDPPlanning />}
      </div>
    </div>
  );
}
