import React, { Component, ReactNode, useEffect } from 'react';
import { useAppStore } from './data/store';
import { Nav } from './components/Nav';
import { IntelligenceDashboard } from './pages/IntelligenceDashboard';
import { ProjectMonitoring } from './pages/ProjectMonitoring';
import { RiskAnomaliesCenter } from './pages/RiskAnomaliesCenter';
import { GISIntelligenceMap } from './pages/GISIntelligenceMap';
import { OfficerVerification } from './pages/OfficerVerification';
import { Analytics } from './pages/Analytics';
import { Methodology } from './pages/Methodology';
import { DatasetExplorer } from './pages/DatasetExplorer';
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
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a1628] text-white p-6">
          <div className="p-6 rounded-lg bg-red-950/80 border border-red-800 text-center max-w-lg space-y-4 shadow-2xl">
            <AlertCircle size={40} className="text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-red-100">Application Error Detected</h2>
            <p className="text-xs font-mono bg-[#0a1628] p-3 rounded text-red-300 text-left overflow-x-auto">
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
  const { currentPage, loadDatasets, isLoading, loadError } = useAppStore();

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a1628] text-white p-6">
        <div className="p-4 rounded-lg bg-red-950/60 border border-red-800 text-center max-w-md space-y-3">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-red-200">Error Loading Datasets</h2>
          <p className="text-xs text-red-300">{loadError}</p>
          <button
            onClick={() => loadDatasets()}
            className="btn-primary text-xs"
          >
            Retry Loading Datasets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100 grid-bg font-sans">
      <Nav />

      {/* Main Container */}
      <main className="pt-24 px-4 pb-12 max-w-[1600px] mx-auto">
        {currentPage === 'dashboard' && <IntelligenceDashboard />}
        {currentPage === 'monitoring' && <ProjectMonitoring />}
        {currentPage === 'anomalies' && <RiskAnomaliesCenter />}
        {currentPage === 'gis' && <GISIntelligenceMap />}
        {currentPage === 'verification' && <OfficerVerification />}
        {currentPage === 'analytics' && <Analytics />}
        {currentPage === 'methodology' && <Methodology />}
        {currentPage === 'explorer' && <DatasetExplorer />}
      </main>
    </div>
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
