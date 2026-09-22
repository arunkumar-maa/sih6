import React, { useState, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { ROLE_DASHBOARD_ROUTES } from '../types/auth';
import {
  Landmark,
  Users,
  FolderGit2,
  MapPin,
  BarChart3,
  HelpCircle,
  AlertCircle,
  Search,
  LogIn,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface PublicLayoutProps {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function PublicLayout({ children, currentPath, onNavigate }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, profile, logout } = useAuthStore();

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Landmark },
    { label: 'MPs', path: '/mps', icon: Users },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Map', path: '/map', icon: MapPin },
    { label: 'Report an Issue', path: '/complaints/report', icon: AlertCircle, highlight: true },
    { label: 'Track Complaint', path: '/complaints/track', icon: Search },
  ];

  const userDashboardUrl = profile?.role ? (ROLE_DASHBOARD_ROUTES[profile.role] || '/admin/dashboard') : '/login';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#141d23] flex flex-col font-sans selection:bg-[#005eb2]/10 selection:text-[#00204a]">
      {/* ── Official Government Portal Header ────────────────── */}
      <header className="sticky top-0 z-50 bg-[#000a1f] text-white shadow-md border-b border-[#00204a]">
        {/* National Flag Accent Ribbon */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Title */}
            <div
              onClick={() => handleNav('/')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-sm bg-[#00204a] border border-[#005eb2]/40 flex items-center justify-center text-[#aec7fa] group-hover:border-[#005eb2] transition-colors shadow-sm">
                <Landmark size={22} className="text-[#aec7fa]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className="text-base font-extrabold tracking-wider text-white uppercase"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    MPLADS SENTINEL
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#005eb2]/40 text-[#aec7fa] border border-[#005eb2]/60">
                    Public Portal
                  </span>
                </div>
                <span className="text-[11px] text-[#7189b8] font-medium hidden md:inline">
                  Public Monitoring & Transparency Portal
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/'
                    ? currentPath === '/'
                    : currentPath.startsWith(item.path);

                if (item.highlight) {
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#DC3545] text-white shadow-sm ring-1 ring-white/20'
                          : 'bg-[#DC3545]/90 hover:bg-[#DC3545] text-white'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#00204a] text-white font-semibold border-b-2 border-[#aec7fa]'
                        : 'text-[#aec7fa] hover:text-white hover:bg-[#00204a]/50'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-[#aec7fa]' : 'text-[#7189b8]'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Auth Action (Login or Dashboard) */}
            <div className="hidden sm:flex items-center gap-3">
              {isAuthenticated && profile ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNav(userDashboardUrl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#005eb2] hover:bg-[#004b8f] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <LayoutDashboard size={14} />
                    <span>Dashboard ({profile.role.replace(/_/g, ' ')})</span>
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      handleNav('/');
                    }}
                    title="Sign Out"
                    className="p-1.5 rounded-sm text-[#aec7fa] hover:text-white hover:bg-[#00204a] transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNav('/login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-[#00204a] hover:bg-[#003161] text-[#aec7fa] hover:text-white border border-[#005eb2]/40 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Officer Login</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-sm text-[#aec7fa] hover:text-white hover:bg-[#00204a] cursor-pointer"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#001433] border-b border-[#00204a] px-4 pt-2 pb-4 space-y-1 animate-fade-in">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-medium cursor-pointer ${
                    isActive
                      ? 'bg-[#00204a] text-white font-bold'
                      : 'text-[#aec7fa] hover:bg-[#00204a]/60 hover:text-white'
                  } ${item.highlight ? 'text-[#DC3545] font-bold' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-[#7189b8]" />
                </button>
              );
            })}

            <div className="pt-3 border-t border-[#00204a] mt-2">
              {isAuthenticated && profile ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleNav(userDashboardUrl)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#005eb2] text-white text-xs font-semibold rounded-sm cursor-pointer"
                  >
                    <LayoutDashboard size={14} />
                    <span>Go to Dashboard</span>
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      handleNav('/');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#00204a] text-[#aec7fa] text-xs font-semibold rounded-sm cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#00204a] border border-[#005eb2]/40 text-[#aec7fa] text-xs font-semibold rounded-sm cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Officer Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content Area ───────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* ── Official Government Transparency Footer ─────────── */}
      <footer className="bg-[#000a1f] text-[#7189b8] border-t border-[#00204a] mt-16 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: System Identification */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold tracking-wider uppercase">
                <Landmark size={18} className="text-[#aec7fa]" />
                <span style={{ fontFamily: 'Montserrat, sans-serif' }}>MPLADS SENTINEL</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#7189b8]">
                An open public monitoring and civic transparency portal for Lok Sabha Members of Parliament Local Area Development Scheme (MPLADS) works.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#aec7fa]">
                <ShieldCheck size={14} />
                <span>Dataset: Official Lok Sabha Works (65,000 Records)</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <p className="text-white font-semibold uppercase tracking-wider text-[11px] mb-3">
                Public Navigation
              </p>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <button onClick={() => handleNav('/')} className="hover:text-white transition-colors cursor-pointer">
                    Home & Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/mps')} className="hover:text-white transition-colors cursor-pointer">
                    Lok Sabha MP Directory (543 MPs)
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/projects')} className="hover:text-white transition-colors cursor-pointer">
                    Project Explorer
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/map')} className="hover:text-white transition-colors cursor-pointer">
                    Constituency GIS Map
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Grievance & Redressal */}
            <div>
              <p className="text-white font-semibold uppercase tracking-wider text-[11px] mb-3">
                Civic Grievance Redressal
              </p>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <button onClick={() => handleNav('/complaints/report')} className="text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer">
                    Report an Issue About a Project
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/complaints/track')} className="hover:text-white transition-colors cursor-pointer">
                    Track Existing Grievance Status
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Data Transparency & Disclaimer */}
            <div>
              <p className="text-white font-semibold uppercase tracking-wider text-[11px] mb-3">
                Transparency & Attribution
              </p>
              <p className="text-[11px] leading-relaxed text-[#7189b8] mb-2">
                Data derived from the official Ministry of Statistics and Programme Implementation (MoSPI) public records.
              </p>
              <p className="text-[10px] text-[#7189b8]/80 leading-normal">
                Notice: Attention indicators represent algorithmic signals intended for administrative review and civic awareness. They do not constitute formal findings of wrongdoing.
              </p>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-[#00204a]/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7189b8]">
            <p>© {new Date().getFullYear()} MPLADS Sentinel — Public Monitoring & Transparency Platform</p>
            <p className="mt-2 sm:mt-0">Designed for Lok Sabha Public Transparency</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
