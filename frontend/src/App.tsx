import React, { Component, ReactNode, useEffect } from 'react';
import { useAppStore } from './store/store';
import { MainLayout } from './layouts/MainLayout';
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
import { AlertCircle, RefreshCw } from 'lucide-react';

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

export function MainContent() {
  const { currentPage, loadDatasets, loadError } = useAppStore();

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

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
    <MainLayout>
      {currentPage === 'dashboard'    && <IntelligenceDashboard />}
      {currentPage === 'monitoring'   && <ProjectMonitoring />}
      {currentPage === 'anomalies'    && <RiskAnomaliesCenter />}
      {currentPage === 'gis'          && <GISIntelligenceMap />}
      {currentPage === 'verification' && <OfficerVerification />}
      {currentPage === 'analytics'    && <Analytics />}
      {currentPage === 'explorer'     && <DatasetExplorer />}
      {currentPage === 'sanctioned'   && <SanctionedDrillDown />}
      {currentPage === 'disbursed'    && <DisbursementDrillDown />}
      {currentPage === 'completed'    && <CompletedWorksDrillDown />}
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
