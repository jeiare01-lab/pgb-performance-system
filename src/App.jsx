import { useState } from 'react';
import Dashboard from './components/Dashboard';
import AppraisalForm from './components/AppraisalForm';
import KPITracker from './components/KPITracker';
import PIPManagement from './components/PIPManagement';
import PromotionEligibility from './components/PromotionEligibility';

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
        {ActiveComponent ? (
          <ErrorBoundary>
            <ActiveComponent />
          </ErrorBoundary>
        ) : (
          <p>Tab not found</p>
        )}
      </main>
    </div>
  );
}

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  if (hasError) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee', borderRadius: '4px' }}>
        <h2 style={{ color: '#c33' }}>⚠️ Component Error</h2>
        <p style={{ color: '#c33', fontSize: '14px' }}>{error?.toString()}</p>
      </div>
    );
  }

  try {
    return children;
  } catch (err) {
    setError(err);
    setHasError(true);
    return null;
  }
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
    borderBottom: '3px solid transparent',
  },
  main: {
    padding: '0',
  },
};
