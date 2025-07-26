import { UserRole } from 'src/enum';
import jsonData from 'src/url.json';

const URL_BASE_LINK = jsonData.API_LOCAL_URL;

export interface User {
  user_id: string;
  id: string;
  name: string;
  displayName?: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
}

/**
 * Get admin and trainer user IDs for email notifications
 * This function should be customized based on your application's user management system
 */
export const getAdminTrainerUserIds = async (authToken: string): Promise<string[]> => {
  try {
    // Option 1: If you have an API endpoint to get admin/trainer users
    const response = await fetch(`${URL_BASE_LINK}/users/admin-trainers`, {
      headers: {
        'Authorization': authToken,
      },
    });

    if (response.ok) {
      const users = await response.json();
      return users.map((user: User) => user.user_id || user.id);
    }
  } catch (error) {
    console.warn('Could not fetch admin/trainer users from API:', error);
  }

  // Option 2: Fallback - return default admin user IDs
  // You should replace these with actual admin/trainer user IDs from your system
  return ['7']; // Default admin user ID as shown in the API example
};

/**
 * Get user IDs based on form assignment
 * This function can be used to get specific trainers assigned to a form
 */
export const getFormAssignedUserIds = async (
  formId: string, 
  authToken: string
): Promise<string[]> => {
  try {
    const response = await fetch(`${URL_BASE_LINK}/forms/${formId}/assigned-users`, {
      headers: {
        'Authorization': authToken,
      },
    });

    if (response.ok) {
      const assignedUsers = await response.json();
      return assignedUsers.map((user: User) => user.user_id || user.id);
    }
  } catch (error) {
    console.warn('Could not fetch form assigned users:', error);
  }

  // Fallback to general admin/trainer users
  return getAdminTrainerUserIds(authToken);
};

/**
 * Format user information for PDF generation
 */
export const formatUserForPDF = (user: any) => {
  return {
    name: user.displayName || user.name || 'Unknown User',
    email: user.email || 'No email provided',
    phone: user.mobile || user.phone || undefined,
  };
};

/**
 * Get authentication token from storage
 */
export const getAuthToken = (): string | null => {
  // Try learner token first
  const learnerToken = sessionStorage.getItem('learnerToken');
  if (learnerToken) {
    try {
      const parsed = JSON.parse(learnerToken);
      return parsed.accessToken;
    } catch (error) {
      console.warn('Could not parse learner token:', error);
    }
  }

  // Fallback to regular JWT token
  return localStorage.getItem('accessToken');
};
