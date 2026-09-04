import { useState, Suspense, lazy } from 'react';

// Lazy load components with error boundaries
const Dashboard = lazy(() => import('./components/Dashboard').catch(() => ({ default: () => <div>Dashboard failed to load</div> })));
const AppraisalForm = lazy(() => import('./components/AppraisalForm').catch(() => ({ default: () => <div>Appraisal Form failed to load</div> })));
const KPITracker = lazy(() => import('./components/KPITracker').catch(() => ({ default: () => <div>KPI Tracker failed to load</div> })));
const PIPManagement = lazy(() => import('./components/PIPManagement').catch(() => ({ default: () => <div>PIP Management failed to load</div> })));
const PromotionEligibility = lazy(() => import('./components/PromotionEligibility').catch(() => ({ default: () => <div>Promotion Eligibility failed to load</div> })));

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: Dashboard },
    { id: 'appraisal', label: 'Appraisal Form', component: AppraisalForm },
    { id: 'kpi', label: 'KPI Tracker', component: KPITracker },
    { id: 'pip', label: 'PIP Management', component: PIPManagement },
    { id: 'promotion', label: 'Promotion Eligibility', component: PromotionEligibility },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1>PGB Performance Management System</h1>
        <span style={styles.demoLabel}>Demo Mode</span>
      </header>

      <nav style={styles.nav}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#333',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={styles.main}>
        <Suspense fallback={<div style={{ padding: '20px' }}>Loading...</div>}>
          {ActiveComponent && <ActiveComponent />}
        </Suspense>
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#333',
    color: '#fff',
  },
  demoLabel: {
    fontSize: '12px',
    backgroundColor: '#666',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  nav: {
    display: 'flex',
    gap: '0',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#f5f5f5',
  },
  navButton: {
    padding: '12px 16px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  main: {
    padding: '0',
  },
};
