import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase.service.js';
import type { UserProfile, UserRole, Permission } from '../types/auth.js';
import { hasPermission, getUserDataScope } from '../utils/rbac.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
      profile?: UserProfile;
    }
  }
}

/**
 * Middleware: requireAuth
 * Validates the Authorization Bearer JWT token against Supabase Auth,
 * loads the active UserProfile from public.profiles, and attaches req.user and req.profile.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: missing or malformed Authorization header.',
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.',
      });
    }

    // Load active profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .eq('is_active', true)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        success: false,
        message: 'User profile not found or account is deactivated.',
      });
    }

    req.user = authData.user;
    req.profile = profile as UserProfile;
    next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Authentication error: ${err.message}`,
    });
  }
}

/**
 * Middleware: optionalAuth
 * If Bearer token is provided, resolves profile; otherwise proceeds unauthenticated.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: authData } = await supabase.auth.getUser(token);
      if (authData?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', authData.user.id)
          .eq('is_active', true)
          .single();

        if (profile) {
          req.user = authData.user;
          req.profile = profile as UserProfile;
        }
      }
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
}

/**
 * Middleware: requireRole
 * Enforces that req.profile.role matches one of the allowed canonical roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.profile) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required before checking role.',
      });
    }

    if (!allowedRoles.includes(req.profile.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Role "${req.profile.role}" is not authorized for this resource. Required: [${allowedRoles.join(', ')}].`,
      });
    }

    next();
  };
}

/**
 * Middleware: requirePermission
 * Enforces that req.profile possesses all specified permissions.
 */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.profile) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required before checking permissions.',
      });
    }

    const missing = permissions.filter(p => !hasPermission(req.profile!.role, p));
    if (missing.length > 0) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Missing required permissions: [${missing.join(', ')}].`,
      });
    }

    next();
  };
}
