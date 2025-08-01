/**
 * User Data Normalization Utility
 * Handles consistent data transformation for user objects across the application
 */

/**
 * Normalizes user data to ensure consistent structure
 * Ensures data is available at both top-level and nested profile object
 * @param {Object} user - Raw user data from API
 * @returns {Object} - Normalized user data
 */
export const normalizeUserData = (user) => {
  if (!user) return null;

  // Extract profile fields from various possible locations
  const phone = user.phone || user.profile?.phone || '';
  const company = user.company || user.profile?.company || '';
  const position = user.position || user.profile?.position || '';

  return {
    ...user,
    // Ensure top-level fields exist
    phone,
    company,
    position,
    // Ensure nested profile object exists with all fields
    profile: {
      ...user.profile,
      phone,
      company,
      position,
    },
    // Ensure boolean flags have defaults
    profileComplete: user.profileComplete || false,
    isEmailVerified: user.isEmailVerified || false,
    emailVerified: user.emailVerified || false,
  };
};

/**
 * Prepares user data for API submission
 * Ensures clean data structure for backend consumption
 * @param {Object} profileData - Profile data to submit
 * @returns {Object} - Clean data for API
 */
export const prepareProfileDataForAPI = (profileData) => {
  return {
    name: profileData.name || '',
    phone: profileData.phone || '',
    company: profileData.company || '',
    position: profileData.position || '',
  };
};

/**
 * Validates user profile data
 * @param {Object} profileData - Profile data to validate
 * @returns {Object} - Validation result with errors array
 */
export const validateProfileData = (profileData) => {
  const errors = [];

  if (!profileData.name || profileData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!profileData.phone || profileData.phone.trim().length < 10) {
    errors.push('Phone number must be at least 10 characters long');
  }

  if (!profileData.company || profileData.company.trim().length < 2) {
    errors.push('Company name must be at least 2 characters long');
  }

  if (!profileData.position || profileData.position.trim().length < 2) {
    errors.push('Position must be at least 2 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Checks if user profile is complete
 * @param {Object} user - User object to check
 * @returns {boolean} - True if profile is complete
 */
export const isProfileComplete = (user) => {
  if (!user) return false;
  
  const hasName = user.name && user.name.trim().length > 0;
  const hasPhone = (user.phone || user.profile?.phone || '').trim().length > 0;
  const hasCompany = (user.company || user.profile?.company || '').trim().length > 0;
  const hasPosition = (user.position || user.profile?.position || '').trim().length > 0;

  return hasName && hasPhone && hasCompany && hasPosition;
};

/**
 * Creates a user display name from available data
 * @param {Object} user - User object
 * @returns {string} - Display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'User';
  
  if (user.name) return user.name;
  if (user.email) return user.email.split('@')[0];
  
  return 'User';
};
