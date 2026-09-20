import type { UserRole, Permission, UserProfile, DataScope } from '../types/auth.js';

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
    'ANALYTICS_VIEW',
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

export function getUserDataScope(profile: UserProfile): DataScope {
  switch (profile.role) {
    case 'MOSPI_ADMIN':
      return { scope: 'NATIONAL' };

    case 'STATE_NODAL_OFFICER':
      return {
        scope: 'STATE',
        state: profile.state || '',
      };

    case 'DISTRICT_OFFICER':
      return {
        scope: 'DISTRICT',
        district: profile.district || '',
        state: profile.state || undefined,
      };

    case 'IMPLEMENTING_AGENCY':
      return {
        scope: 'AGENCY',
        agency: profile.agency_name || '',
      };

    case 'MP':
      return {
        scope: 'MP',
        mpId: profile.mp_id || undefined,
        mpName: profile.mp_name || '',
        house: profile.house || 'Lok Sabha',
        constituency: profile.constituency || undefined,
        state: profile.state || undefined,
      };

    case 'AUDITOR':
      return { scope: 'AUTHORIZED_AUDIT_SCOPE' };

    default:
      return { scope: 'AUTHORIZED_AUDIT_SCOPE' };
  }
}
