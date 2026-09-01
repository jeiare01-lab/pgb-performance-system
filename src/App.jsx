import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import AppraisalForm from './components/AppraisalForm';
import KPITracker from './components/KPITracker';
import PIPManagement from './components/PIPManagement';
import PromotionEligibility from './components/PromotionEligibility';
import IDPPlanning from './components/IDPPlanning';
import { BarChart3, FileText, AlertCircle, TrendingUp, Users, Target } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('supervisor'); // supervisor, hr, executive

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
      if (data?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
        setUserRole(profile?.role || 'supervisor');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50"><div className="text-slate-600">Loading...</div></div>;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['supervisor', 'hr', 'executive'] },
    { id: 'appraisal', label: 'Appraisal', icon: FileText, roles: ['supervisor', 'hr'] },
    { id: 'kpi-tracker', label: 'KPI Tracking', icon: Target, roles: ['supervisor', 'hr', 'executive'] },
    { id: 'pip', label: 'Performance Improvement', icon: AlertCircle, roles: ['supervisor', 'hr', 'executive'] },
    { id: 'promotion', label: 'Promotion Eligibility', icon: TrendingUp, roles: ['hr', 'executive'] },
    { id: 'idp', label: 'IDP & Succession', icon: Users, roles: ['hr', 'executive'] },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Performance Management System</h1>
              <p className="text-sm text-slate-500 mt-1">PGB · Shared Services · HR Division</p>
            </div>
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.email}</p>
                <p className="text-xs text-slate-500 capitalize mt-1">{userRole}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <Dashboard userRole={userRole} />}
        {activeTab === 'appraisal' && <AppraisalForm userRole={userRole} />}
        {activeTab === 'kpi-tracker' && <KPITracker userRole={userRole} />}
        {activeTab === 'pip' && <PIPManagement userRole={userRole} />}
        {activeTab === 'promotion' && <PromotionEligibility userRole={userRole} />}
        {activeTab === 'idp' && <IDPPlanning userRole={userRole} />}
      </main>
    </div>
  );
}
