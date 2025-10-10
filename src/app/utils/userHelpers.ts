/**
 * User Helper Utilities
 * 
 * Unified way to access user data across the application
 * Use these helpers instead of accessing sessionStorage or Redux directly
 */

import { useSelector } from 'react-redux';
import { selectAuthUser } from 'app/store/authSlice';
import { selectUser } from 'app/store/userSlice'; // Legacy fallback

/**
 * Get current user data
 * 
 * Priority:
 * 1. Learner tab user (admin viewing as learner) - from sessionStorage
 * 2. Authenticated user (from authSlice)
 * 3. Legacy user (from userSlice) - backwards compatibility
 */
export const useCurrentUser = () => {
  // Check for learner tab (when admin is viewing as learner)
  const learnerTabUser = sessionStorage.getItem('learnerToken')
    ? JSON.parse(sessionStorage.getItem('learnerToken'))?.user
    : null;

  // Get authenticated user from new authSlice
  const authUser = useSelector(selectAuthUser);
  
  // Fallback to legacy userSlice for backwards compatibility
  const legacyUser = useSelector(selectUser)?.data;

  // Priority: learner tab > auth user > legacy user
  return learnerTabUser || authUser || legacyUser || {};
};

/**
 * Check if user has a specific role
 */
export const useUserRole = () => {
  const user = useCurrentUser();
  return user?.role || null;
};

/**
 * Check if current user has any of the specified roles
 */
export const useHasRole = (...roles: string[]) => {
  const userRole = useUserRole();
  return roles.includes(userRole);
};

/**
 * Get user ID
 */
export const useUserId = () => {
  const user = useCurrentUser();
  return user?.user_id || user?.learner_id || null;
};
