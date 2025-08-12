// Profile Management Service
import { 
  doc, 
  updateDoc, 
  getDoc
} from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { validateUser, createTimestamp } from '../models/dataModels';
import { updateUserProfile, getUserProfile } from './databaseService';

// Get current user profile
export const getCurrentUserProfile = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const result = await getUserProfile(currentUser.uid);
    return result;
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return { success: false, error: error.message };
  }
};

// Update user profile information
export const updateUserProfileData = async (updateData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate the update data
    const validation = validateUser({ ...updateData, email: currentUser.email });
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    // Update Firebase Auth profile if displayName or photoURL changed
    const authUpdates = {};
    if (updateData.displayName !== undefined) {
      authUpdates.displayName = updateData.displayName;
    }
    if (updateData.photoURL !== undefined) {
      authUpdates.photoURL = updateData.photoURL;
    }

    if (Object.keys(authUpdates).length > 0) {
      await updateProfile(currentUser, authUpdates);
    }

    // Update Firestore profile
    const result = await updateUserProfile(currentUser.uid, {
      ...updateData,
      updatedAt: createTimestamp()
    });

    return result;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// Update user preferences
export const updateUserPreferences = async (preferences) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const result = await updateUserProfile(currentUser.uid, {
      preferences,
      updatedAt: createTimestamp()
    });

    return result;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { success: false, error: error.message };
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (notificationSettings) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get current profile to merge preferences
    const profileResult = await getUserProfile(currentUser.uid);
    if (!profileResult.success) {
      return { success: false, error: 'Could not get user profile' };
    }

    const currentPreferences = profileResult.data.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      notifications: {
        ...currentPreferences.notifications,
        ...notificationSettings
      }
    };

    const result = await updateUserProfile(currentUser.uid, {
      preferences: updatedPreferences,
      updatedAt: createTimestamp()
    });

    return result;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: error.message };
  }
};

// Update privacy settings
export const updatePrivacySettings = async (privacySettings) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get current profile to merge preferences
    const profileResult = await getUserProfile(currentUser.uid);
    if (!profileResult.success) {
      return { success: false, error: 'Could not get user profile' };
    }

    const currentPreferences = profileResult.data.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      privacy: {
        ...currentPreferences.privacy,
        ...privacySettings
      }
    };

    const result = await updateUserProfile(currentUser.uid, {
      preferences: updatedPreferences,
      updatedAt: createTimestamp()
    });

    return result;
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return { success: false, error: error.message };
  }
};

// Change user email
export const changeUserEmail = async (newEmail, password) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Re-authenticate user before changing email
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, currentUser.email, password);

    // Update email in Firebase Auth
    await updateEmail(currentUser, newEmail);

    // Update email in Firestore
    const result = await updateUserProfile(currentUser.uid, {
      email: newEmail,
      updatedAt: createTimestamp()
    });

    return result;
  } catch (error) {
    console.error('Error changing user email:', error);
    return { success: false, error: error.message };
  }
};

// Change user password
export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Re-authenticate user before changing password
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, currentUser.email, currentPassword);

    // Update password in Firebase Auth
    await updatePassword(currentUser, newPassword);

    return { success: true };
  } catch (error) {
    console.error('Error changing user password:', error);
    return { success: false, error: error.message };
  }
};

// Delete user account
export const deleteUserAccount = async (password) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Re-authenticate user before deleting account
    const { signInWithEmailAndPassword, deleteUser } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, currentUser.email, password);

    // Delete user document from Firestore
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'users', currentUser.uid));

    // Delete user from Firebase Auth
    await deleteUser(currentUser);

    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { success: false, error: error.message };
  }
};