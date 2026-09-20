import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ROLE_DASHBOARD_ROUTES } from '../types/auth';

interface AccessDeniedProps {
  attemptedRoute?: string;
}

export function AccessDenied({ attemptedRoute }: AccessDeniedProps) {
  const { profile, logout } = useAuthStore();

  const handleReturn = () => {
    if (profile?.role) {
      const authorizedRoute = ROLE_DASHBOARD_ROUTES[profile.role] || '/admin/dashboard';
      window.history.pushState({}, '', authorizedRoute);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faff] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-[#E9ECEF] rounded-sm shadow-[0_8px_24px_rgba(0,10,31,0.08)] p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FFF5F5] border border-[#FFD8D8] flex items-center justify-center mx-auto text-[#DC3545]">
          <ShieldAlert size={32} />
        </div>

        <div>
          <span className="text-[10px] font-bold text-[#DC3545] tracking-widest uppercase bg-[#FFF5F5] border border-[#FFD8D8] px-2.5 py-1 rounded-full">
            Security Exception · 403 Forbidden
          </span>
          <h2
            className="text-xl font-bold text-[#000a1f] mt-3"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Restricted Command Portal
          </h2>
          <p className="text-xs text-[#44474f] mt-2 leading-relaxed">
            Your assigned role does not possess administrative authorization to access the requested portal{' '}
            {attemptedRoute && <code className="font-mono bg-[#F8F9FA] px-1 py-0.5 rounded text-[#000a1f]">{attemptedRoute}</code>}.
          </p>
        </div>

        {profile && (
          <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-sm p-3.5 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#747780]">Current Identity:</span>
              <span className="font-semibold text-[#000a1f]">{profile.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#747780]">Assigned Role:</span>
              <span className="font-semibold text-[#00204a]">{profile.role}</span>
            </div>
            {profile.state && (
              <div className="flex justify-between">
                <span className="text-[#747780]">Jurisdiction:</span>
                <span className="font-semibold text-[#44474f]">
                  {profile.district ? `${profile.district}, ` : ''}{profile.state}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleReturn}
            className="btn-primary w-full text-xs flex items-center justify-center gap-2 py-2.5"
          >
            <ArrowLeft size={14} /> Return to My Authorized Dashboard
          </button>
          <button
            onClick={() => logout()}
            className="w-full text-xs text-[#747780] hover:text-[#DC3545] flex items-center justify-center gap-1.5 py-2 transition-colors"
          >
            <LogOut size={13} /> Sign Out of Platform
          </button>
        </div>
      </div>
    </div>
  );
}
