export type UserRole =
  | 'MOSPI_ADMIN'
  | 'STATE_NODAL_OFFICER'
  | 'DISTRICT_OFFICER'
  | 'IMPLEMENTING_AGENCY'
  | 'MP'
  | 'AUDITOR';

export type Permission =
  | 'PROJECT_VIEW'
  | 'PROJECT_UPDATE'
  | 'PROJECT_RECOMMEND'
  | 'PROJECT_VERIFY'
  | 'ANOMALY_VIEW'
  | 'ANOMALY_REVIEW'
  | 'ANALYTICS_VIEW'
  | 'GIS_VIEW'
  | 'AUDIT_VIEW'
  | 'USER_MANAGE';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  role: UserRole;
  house?: 'Lok Sabha' | 'Rajya Sabha' | null;
  state?: string | null;
  district?: string | null;
  constituency?: string | null;
  mp_name?: string | null;
  mp_id?: string | null;
  agency_name?: string | null;
  agency_id?: string | null;
  email?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DataScope =
  | { scope: 'NATIONAL' }
  | { scope: 'STATE'; state: string }
  | { scope: 'DISTRICT'; district: string; state?: string }
  | { scope: 'AGENCY'; agency: string }
  | {
      scope: 'MP';
      mpId?: string;
      mpName: string;
      house: 'Lok Sabha' | 'Rajya Sabha';
      constituency?: string;
      state?: string;
    }
  | { scope: 'AUTHORIZED_AUDIT_SCOPE' };

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  MOSPI_ADMIN: [
    'PROJECT_VIEW',
    'PROJECT_UPDATE',
    'PROJECT_RECOMMEND',
    'PROJECT_VERIFY',
    'ANOMALY_VIEW',
    'ANOMALY_REVIEW',
    'ANALYTICS_VIEW',
    'GIS_VIEW',
    'AUDIT_VIEW',
    'USER_MANAGE',
  ],
  STATE_NODAL_OFFICER: [
    'PROJECT_VIEW',
    'PROJECT_VERIFY',
    'ANOMALY_VIEW',
    'ANALYTICS_VIEW',
    'GIS_VIEW',
    'AUDIT_VIEW',
  ],
  DISTRICT_OFFICER: [
    'PROJECT_VIEW',
    'PROJECT_VERIFY',
    'ANOMALY_VIEW',
    'GIS_VIEW',
    'AUDIT_VIEW',
  ],
  IMPLEMENTING_AGENCY: [
    'PROJECT_VIEW',
    'PROJECT_UPDATE',
  ],
  MP: [
    'PROJECT_VIEW',
    'GIS_VIEW',
    'PROJECT_RECOMMEND',
  ],
  AUDITOR: [
    'PROJECT_VIEW',
    'PROJECT_VERIFY',
    'ANOMALY_VIEW',
    'ANOMALY_REVIEW',
    'AUDIT_VIEW',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  MOSPI_ADMIN: '/admin/dashboard',
  STATE_NODAL_OFFICER: '/state/dashboard',
  DISTRICT_OFFICER: '/district/dashboard',
  IMPLEMENTING_AGENCY: '/implementing-agency',
  MP: '/mp/dashboard',
  AUDITOR: '/auditor/dashboard',
};
