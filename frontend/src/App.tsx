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
import { MpProfilePage } from './pages/MpProfilePage';
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

// Public Transparency Portal Views
import { PublicLayout } from './layouts/PublicLayout';
import { PublicHomePage } from './pages/public/PublicHomePage';
import { PublicMpDirectory } from './pages/public/PublicMpDirectory';
import { PublicMpProfile } from './pages/public/PublicMpProfile';
import { PublicProjectExplorer } from './pages/public/PublicProjectExplorer';
import { PublicProjectDetail } from './pages/public/PublicProjectDetail';
import { PublicMapPage } from './pages/public/PublicMapPage';
import { PublicAnalyticsPage } from './pages/public/PublicAnalyticsPage';
import { AboutMethodologyPage } from './pages/public/AboutMethodologyPage';
import { PublicComplaintPage } from './pages/public/PublicComplaintPage';
import { PublicComplaintTrackPage } from './pages/public/PublicComplaintTrackPage';

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
  profile: ['MP', 'MOSPI_ADMIN'],
};

// Helper to determine if a route is public
function isPublicPath(path: string, isAuthenticated: boolean = false): boolean {
  // When an authenticated official accesses /analytics, render the authenticated official module inside MainLayout
  if (isAuthenticated && path === '/analytics') {
    return false;
  }
  if (
    path === '/' ||
    path === '/mps' ||
    path === '/projects' ||
    path === '/map' ||
    path === '/analytics' ||
    path === '/about' ||
    path === '/methodology' ||
    path === '/complaints/report' ||
    path === '/complaints/track' ||
    path === '/report'
  ) {
    return true;
  }
  if (path.startsWith('/projects/')) {
    return true;
  }
  if (path.startsWith('/mp/') && path !== '/mp/dashboard' && path !== '/mp/profile') {
    return true;
  }
  return false;
}

// Render the active public view
function renderPublicPage(path: string, navigateTo: (p: string) => void) {
  if (path === '/') {
    return <PublicHomePage onNavigate={navigateTo} />;
  }
  if (path === '/mps') {
    return <PublicMpDirectory onNavigate={navigateTo} />;
  }
  if (path.startsWith('/mp/') && path !== '/mp/dashboard' && path !== '/mp/profile') {
    const mpId = path.replace('/mp/', '');
    return <PublicMpProfile mpId={mpId} onNavigate={navigateTo} />;
  }
  if (path === '/projects') {
    return <PublicProjectExplorer onNavigate={navigateTo} />;
  }
  if (path.startsWith('/projects/')) {
    const workId = decodeURIComponent(path.replace('/projects/', ''));
    return <PublicProjectDetail workId={workId} onNavigate={navigateTo} />;
  }
  if (path === '/map') {
    return <PublicMapPage onNavigate={navigateTo} />;
  }
  if (path === '/analytics') {
    return <PublicAnalyticsPage onNavigate={navigateTo} />;
  }
  if (path === '/about' || path === '/methodology') {
    return <AboutMethodologyPage onNavigate={navigateTo} />;
  }
  if (path === '/complaints/report' || path === '/report') {
    const params = new URLSearchParams(window.location.search);
    const initialWorkId = params.get('workId') || undefined;
    return <PublicComplaintPage initialWorkId={initialWorkId} onNavigate={navigateTo} />;
  }
  if (path === '/complaints/track') {
    const params = new URLSearchParams(window.location.search);
    const initialCid = params.get('cid') || undefined;
    return <PublicComplaintTrackPage initialCid={initialCid} onNavigate={navigateTo} />;
  }
  return <PublicHomePage onNavigate={navigateTo} />;
}

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
        '/mp/profile': 'profile',
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

  // 1. PUBLIC ROUTES — Unauthenticated citizen access with PublicLayout
  if (isPublicPath(currentPath, isAuthenticated && !!profile)) {
    return (
      <PublicLayout currentPath={currentPath} onNavigate={navigateTo}>
        {renderPublicPage(currentPath, navigateTo)}
      </PublicLayout>
    );
  }

  // 2. LOGIN ROUTE
  if (currentPath === '/login') {
    if (isAuthenticated && profile) {
      const defaultRoute = ROLE_DASHBOARD_ROUTES[profile.role] || '/admin/dashboard';
      window.history.replaceState({}, '', defaultRoute);
      // Fall through to render dashboard
    } else {
      return (
        <LoginPage 
          onLoginSuccess={(redirectUrl) => {
            navigateTo(redirectUrl);
          }} 
        />
      );
    }
  }

  // 3. PROTECTED ROUTES — Redirect unauthenticated users to login page
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

  const effectivePath = currentPath === '/login'
    ? (ROLE_DASHBOARD_ROUTES[role] || '/admin/dashboard')
    : currentPath;

  const effectiveBasePath = effectivePath.split('?')[0];

  // Render role dashboards
  const renderDashboardOrModule = () => {
    // 1. Role-specific dashboards
    if (effectiveBasePath === '/admin/dashboard') {
      if (role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/admin/dashboard" />;
      }
      return <MospiAdminDashboard />;
    }

    if (effectiveBasePath === '/state/dashboard') {
      if (role !== 'STATE_NODAL_OFFICER' && role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/state/dashboard" />;
      }
      return <StateNodalDashboard />;
    }

    if (effectiveBasePath === '/district/dashboard') {
      if (role !== 'DISTRICT_OFFICER' && role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/district/dashboard" />;
      }
      return <DistrictOfficerDashboard />;
    }

    if (effectiveBasePath === '/implementing-agency' || effectiveBasePath === '/agency/dashboard') {
      if (role !== 'IMPLEMENTING_AGENCY') {
        return <AccessDenied attemptedRoute="/implementing-agency" />;
      }
      return <ImplementingAgencyDashboard />;
    }

    if (effectiveBasePath === '/mp/dashboard') {
      if (role !== 'MP' && role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/mp/dashboard" />;
      }
      return <MpDashboard />;
    }

    if (effectiveBasePath === '/mp/profile') {
      if (role !== 'MP' && role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/mp/profile" />;
      }
      return <MpProfilePage />;
    }

    if (effectiveBasePath === '/auditor/dashboard') {
      if (role !== 'AUDITOR' && role !== 'MOSPI_ADMIN') {
        return <AccessDenied attemptedRoute="/auditor/dashboard" />;
      }
      return <AuditorDashboard />;
    }

    // 2. Modular Views (path or currentPage fallback)
    let moduleKey = currentPage;
    if (effectiveBasePath === '/monitoring') moduleKey = 'monitoring';
    else if (effectiveBasePath === '/anomalies') moduleKey = 'anomalies';
    else if (effectiveBasePath === '/gis') moduleKey = 'gis';
    else if (effectiveBasePath === '/verification') moduleKey = 'verification';
    else if (effectiveBasePath === '/analytics') moduleKey = 'analytics';
    else if (effectiveBasePath === '/explorer') moduleKey = 'explorer';
    else if (effectiveBasePath === '/comparative') moduleKey = 'comparative';
    else if (effectiveBasePath === '/sanctioned') moduleKey = 'sanctioned';
    else if (effectiveBasePath === '/disbursed') moduleKey = 'disbursed';
    else if (effectiveBasePath === '/completed') moduleKey = 'completed';
    else if (effectiveBasePath === '/audit-trail') moduleKey = 'audit-trail';
    else if (effectiveBasePath === '/mp/profile') moduleKey = 'profile';

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
      case 'profile':
        return <MpProfilePage />;
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
