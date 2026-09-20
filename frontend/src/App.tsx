import React, { Component, ReactNode, useEffect, useState } from 'react';
import { useAppStore } from './store/store';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { AccessDenied } from './pages/AccessDenied';

// Role-specific Dashboards
import { MospiAdminDashboard } from './pages/dashboards/MospiAdminDashboard';
import { StateNodalDashboard } from './pages/dashboards/StateNodalDashboard';
import { DistrictOfficerDashboard } from './pages/dashboards/DistrictOfficerDashboard';
import { ImplementingAgencyDashboard } from './pages/dashboards/ImplementingAgencyDashboard';
import { MpDashboard } from './pages/dashboards/MpDashboard';
import { AuditorDashboard } from './pages/dashboards/AuditorDashboard';

// Modular Platform Views
import { IntelligenceDashboard } from './pages/IntelligenceDashboard';
import { ProjectMonitoring } from './pages/ProjectMonitoring';
import { RiskAnomaliesCenter } from './pages/RiskAnomaliesCenter';
import { GISIntelligenceMap } from './pages/GISIntelligenceMap';
import { OfficerVerification } from './pages/OfficerVerification';
import { Analytics } from './pages/Analytics';
import { DatasetExplorer } from './pages/DatasetExplorer';
import { SanctionedDrillDown } from './pages/SanctionedDrillDown';
import { DisbursementDrillDown } from './pages/DisbursementDrillDown';
import { CompletedWorksDrillDown } from './pages/CompletedWorksDrillDown';
import { ComparativeIntelligencePage } from './pages/ComparativeIntelligencePage';
import { AuditTrailPage } from './pages/AuditTrailPage';

import { AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { ROLE_DASHBOARD_ROUTES, UserRole } from './types/auth';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6faff] text-[#141d23] p-6">
          <div className="p-6 rounded-sm bg-white border border-[#E9ECEF] shadow-[0_4px_16px_rgba(0,10,31,0.1)] text-center max-w-lg space-y-4">
            <AlertCircle size={40} className="text-[#DC3545] mx-auto" />
            <h2 className="text-xl font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Application Error Detected
            </h2>
            <p className="text-xs font-mono bg-[#F8F9FA] border border-[#E9ECEF] p-3 rounded-sm text-[#DC3545] text-left overflow-x-auto">
              {this.state.error?.message || 'Unknown render error'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-primary text-xs flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} /> Reload System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Section 15: Allowed module permissions
const MODULE_PERMISSIONS: Record<string, UserRole[]> = {
  dashboard: ['MOSPI_ADMIN'],
  monitoring: ['MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER', 'IMPLEMENTING_AGENCY', 'MP', 'AUDITOR'],
  anomalies: ['MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER', 'AUDITOR'],
  gis: ['MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER', 'MP', 'AUDITOR'],
  verification: ['STATE_NODAL_OFFICER', 'DISTRICT_OFFICER', 'AUDITOR'],
  analytics: ['MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER', 'MP', 'AUDITOR'],
  explorer: ['MOSPI_ADMIN', 'AUDITOR'],
  comparative: ['MOSPI_ADMIN', 'STATE_NODAL_OFFICER'],
  sanctioned: ['MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER'],
  disbursed: ['MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER'],
  completed: ['MOSPI_ADMIN', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER'],
  'audit-trail': ['MOSPI_ADMIN', 'AUDITOR', 'STATE_NODAL_OFFICER', 'DISTRICT_OFFICER'],
};

export function MainContent() {
  const { currentPage, setCurrentPage, loadDatasets, loadError } = useAppStore();
  const { profile, isAuthenticated, isLoading: authLoading, initAuth } = useAuthStore();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Initialize auth session on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Listen to popstate and route navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      const routeToPageMap: Record<string, string> = {
        '/monitoring': 'monitoring',
        '/anomalies': 'anomalies',
        '/gis': 'gis',
        '/verification': 'verification',
        '/analytics': 'analytics',
        '/explorer': 'explorer',
        '/comparative': 'comparative',
        '/sanctioned': 'sanctioned',
        '/disbursed': 'disbursed',
        '/completed': 'completed',
        '/audit-trail': 'audit-trail',
        '/admin/dashboard': 'dashboard',
        '/state/dashboard': 'dashboard',
        '/district/dashboard': 'dashboard',
        '/auditor/dashboard': 'dashboard',
        '/implementing-agency': 'dashboard',
        '/agency/dashboard': 'dashboard',
      };
      const matchingPage = routeToPageMap[path];
      if (matchingPage && useAppStore.getState().currentPage !== matchingPage) {
        useAppStore.setState({ currentPage: matchingPage });
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Preload dataset once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadDatasets();
    }
  }, [isAuthenticated, loadDatasets]);

  // Loading state
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6faff]">
        <div className="w-12 h-12 border-3 border-[#00204a] border-t-transparent rounded-full animate-spin mb-4" />
        <div className="flex items-center gap-2 mb-1">
          <Activity size={16} className="text-[#00204a]" />
          <p className="text-sm font-bold text-[#000a1f] tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            MPLADS SENTINEL
          </p>
        </div>
        <p className="text-xs text-[#747780]">
          Verifying Identity & Security Credentials…
        </p>
      </div>
    );
  }

  // If not logged in -> redirect to login page
  if (!isAuthenticated || !profile) {
    return (
      <LoginPage 
        onLoginSuccess={(redirectUrl) => {
          navigateTo(redirectUrl);
        }} 
      />
    );
  }

  const role = profile.role;

  // Root or login path redirect to authorized dashboard
  if (currentPath === '/' || currentPath === '/login') {
    const defaultRoute = ROLE_DASHBOARD_ROUTES[role] || '/admin/dashboard';
    // If not already there, push state
    if (currentPath !== defaultRoute) {
      window.history.replaceState({}, '', defaultRoute);
      // Fall through to render the route directly
    }
  }

  const effectivePath = (currentPath === '/' || currentPath === '/login')
    ? (ROLE_DASHBOARD_ROUTES[role] || '/admin/dashboard')
    : currentPath;

  // Render role dashboards
  const renderDashboardOrModule = () => {
    // 1. Role-specific dashboards
    if (effectivePath === '/admin/dashboard') {
      if (role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/admin/dashboard" />;
      }
      return <MospiAdminDashboard />;
    }

    if (effectivePath === '/state/dashboard') {
      if (role !== 'STATE_NODAL_OFFICER' && role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/state/dashboard" />;
      }
      return <StateNodalDashboard />;
    }

    if (effectivePath === '/district/dashboard') {
      if (role !== 'DISTRICT_OFFICER' && role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/district/dashboard" />;
      }
      return <DistrictOfficerDashboard />;
    }

    if (effectivePath === '/implementing-agency' || effectivePath === '/agency/dashboard') {
      if (role !== 'IMPLEMENTING_AGENCY') {
        return <AccessDenied attemptedRoute="/implementing-agency" />;
      }
      return <ImplementingAgencyDashboard />;
    }

    if (effectivePath === '/mp/dashboard') {
      if (role !== 'MP' && role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/mp/dashboard" />;
      }
      return <MpDashboard />;
    }

    if (effectivePath === '/auditor/dashboard') {
      if (role !== 'AUDITOR' && role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/auditor/dashboard" />;
      }
      return <AuditorDashboard />;
    }

    // 2. Modular Views (path or currentPage fallback)
    let moduleKey = currentPage;
    if (effectivePath === '/monitoring') moduleKey = 'monitoring';
    else if (effectivePath === '/anomalies') moduleKey = 'anomalies';
    else if (effectivePath === '/gis') moduleKey = 'gis';
    else if (effectivePath === '/verification') moduleKey = 'verification';
    else if (effectivePath === '/analytics') moduleKey = 'analytics';
    else if (effectivePath === '/explorer') moduleKey = 'explorer';
    else if (effectivePath === '/comparative') moduleKey = 'comparative';
    else if (effectivePath === '/sanctioned') moduleKey = 'sanctioned';
    else if (effectivePath === '/disbursed') moduleKey = 'disbursed';
    else if (effectivePath === '/completed') moduleKey = 'completed';
    else if (effectivePath === '/audit-trail') moduleKey = 'audit-trail';

    // Verify role permission for requested module
    const allowedRoles = MODULE_PERMISSIONS[moduleKey];
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <AccessDenied attemptedRoute={effectivePath} />;
    }

    // Render corresponding module
    switch (moduleKey) {
      case 'dashboard':
        return <IntelligenceDashboard />;
      case 'monitoring':
        return <ProjectMonitoring />;
      case 'anomalies':
        return <RiskAnomaliesCenter />;
      case 'gis':
        return <GISIntelligenceMap />;
      case 'verification':
        return <OfficerVerification />;
      case 'analytics':
        return <Analytics />;
      case 'explorer':
        return <DatasetExplorer />;
      case 'comparative':
        return <ComparativeIntelligencePage />;
      case 'sanctioned':
        return <SanctionedDrillDown />;
      case 'disbursed':
        return <DisbursementDrillDown />;
      case 'completed':
        return <CompletedWorksDrillDown />;
      case 'audit-trail':
        return <AuditTrailPage />;
      default:
        // Default to role dashboard
        if (role === 'MOSPI_ADMIN') return <MospiAdminDashboard />;
        if (role === 'STATE_NODAL_OFFICER') return <StateNodalDashboard />;
        if (role === 'DISTRICT_OFFICER') return <DistrictOfficerDashboard />;
        if (role === 'IMPLEMENTING_AGENCY') return <ImplementingAgencyDashboard />;
        if (role === 'MP') return <MpDashboard />;
        if (role === 'AUDITOR') return <AuditorDashboard />;
        return <IntelligenceDashboard />;
    }
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6faff] p-6">
        <div className="p-5 rounded-sm bg-white border border-[#E9ECEF] shadow-md text-center max-w-md space-y-3">
          <AlertCircle size={32} className="text-[#DC3545] mx-auto" />
          <h2 className="text-lg font-bold text-[#000a1f]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Database Connection Error
          </h2>
          <p className="text-xs text-[#44474f]">{loadError}</p>
          <button onClick={() => loadDatasets()} className="btn-primary text-xs">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout currentPath={effectivePath} onNavigate={navigateTo}>
      {renderDashboardOrModule()}
    </MainLayout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <MainContent />
    </ErrorBoundary>
  );
}

export default App;
