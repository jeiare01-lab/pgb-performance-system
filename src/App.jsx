import { useState, Suspense, lazy } from 'react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const AppraisalForm = lazy(() => import('./components/AppraisalForm'));
const KPITracker = lazy(() => import('./components/KPITracker'));
const PIPManagement = lazy(() => import('./components/PIPManagement'));
const PromotionEligibility = lazy(() => import('./components/PromotionEligibility'));

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dashboardFilter, setDashboardFilter] = useState('all'); // all, high-performers, pending

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: Dashboard },
    { id: 'appraisal', label: 'Appraisal Form', component: AppraisalForm },
    { id: 'kpi', label: 'KPI Tracker', component: KPITracker },
    { id: 'pip', label: 'PIP Management', component: PIPManagement },
    { id: 'promotion', label: 'Promotion Eligibility', component: PromotionEligibility },
  ];

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setActiveTab('appraisal');
  };

  const handleStatClick = (filterType) => {
    setDashboardFilter(filterType);
    // Stay on dashboard, just change the filter
  };

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  const componentProps = {
    Dashboard: {
      selectedEmployee,
      onEmployeeSelect: handleEmployeeSelect,
      onStatClick: handleStatClick,
      filter: dashboardFilter,
      setFilter: setDashboardFilter,
    },
    AppraisalForm: {
      selectedEmployee,
      onBack: () => setActiveTab('dashboard'),
    },
  };

  const getProps = () => {
    if (activeTab === 'dashboard') return componentProps.Dashboard;
    if (activeTab === 'appraisal') return componentProps.AppraisalForm;
    return {};
  };

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
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'dashboard') setDashboardFilter('all');
            }}
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
          {ActiveComponent && <ActiveComponent {...getProps()} />}
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
