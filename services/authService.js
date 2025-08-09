// Firebase Authentication Service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Sign up with email and password
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Enhanced user profile creation
export const createUserWithProfile = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth profile
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Wait a moment for auth to fully propagate
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create Firestore user profile
    const { createUserProfile } = await import('./databaseService');
    const profileResult = await createUserProfile(user.uid, {
      email: user.email,
      displayName: displayName || '',
      photoURL: user.photoURL || '',
      phoneNumber: user.phoneNumber || '',
      preferences: {
        currency: 'USD',
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          paymentReminders: true,
          groupActivity: true,
        },
        privacy: {
          profileVisible: true,
          allowFriendRequests: true,
        }
      }
    });

    if (!profileResult.success) {
      console.error('Failed to create user profile:', profileResult.error);
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update last login time
export const updateLastLogin = async (userId) => {
  try {
    const { updateUserProfile } = await import('./databaseService');
    await updateUserProfile(userId, {
      lastLoginAt: new Date()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login time
    await updateLastLogin(user.uid);
    
    // Check if user profile exists in Firestore, create if missing
    const { getUserProfile, createUserProfile } = await import('./databaseService');
    const profileResult = await getUserProfile(user.uid);
    
    if (!profileResult.success) {
      console.log('User profile not found, creating one...');
      // Create missing profile (for users who signed up before profile creation was implemented)
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '',
        preferences: {
          currency: 'USD',
          notifications: {
            pushEnabled: true,
            emailEnabled: true,
            paymentReminders: true,
            groupActivity: true,
          },
          privacy: {
            profileVisible: true,
            allowFriendRequests: true,
          }
        }
      });
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Listen to authentication state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};