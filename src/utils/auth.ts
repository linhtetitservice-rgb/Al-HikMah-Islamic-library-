import { UserProfile } from '../types';

export const ADMIN_EMAIL = 'linhtetitservice@gmail.com';

/**
 * Checks if the given user has administrative privileges.
 * Admin email: linhtetitservice@gmail.com or role === 'admin'
 */
export function isUserAdmin(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
