import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import AppraisalForm from './components/AppraisalForm';
import KPITracker from './components/KPITracker';
import PIPManagement from './components/PIPManagement';
import PromotionEligibility from './components/PromotionEligibility';
import IDPPlanning from './components/IDPPlanning';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ color: '#666', padding: '16px' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: '4px', border: '1px solid #ddd', maxWidth: '400px', width: '100%' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
            PGB Performance Management System
          </h1>

          <AuthComponent onAuth={() => setUser(true)} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: '#333', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>PGB Performance Management System</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setUser(null);
          }}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
        >
          Sign Out
        </button>
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

function AuthComponent({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        alert(error.message);
      } else {
        onAuth();
      }
    } catch (err) {
      alert('Auth error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAuth}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '14px' }}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </form>
  );
}
