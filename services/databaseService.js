// Enhanced Firebase Firestore Database Service
import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { 
  validateUser, 
  validateGroup, 
  validateExpense, 
  validatePayment,
  createTimestamp 
} from '../models/dataModels';

// ============ USER OPERATIONS ============

export const createUserProfile = async (userId, userData) => {
  try {
    const validation = validateUser(userData);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const userProfile = {
      ...userData,
      id: userId,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp(),
      lastLoginAt: createTimestamp()
    };

    await setDoc(doc(db, 'users', userId), userProfile);
    
    // Create username mapping if username is provided
    if (userData.username) {
      const usernameResult = await createUsernameMapping(userData.username, userId);
      if (!usernameResult.success) {
        console.error('Failed to create username mapping:', usernameResult.error);
        // Don't fail the entire profile creation, just log the error
      }
    }
    
    return { success: true, data: userProfile };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: createTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const findUserByEmail = async (email) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'User not found' };
    }
    
    const userDoc = querySnapshot.docs[0];
    return { 
      success: true, 
      data: { id: userDoc.id, ...userDoc.data() }
    };
  } catch (error) {
    console.error('Error finding user by email:', error);
    
    // Handle permission errors specifically
    if (error.code === 'permission-denied') {
      return { 
        success: false, 
        error: 'Permission denied. Please check Firestore security rules.',
        isPermissionError: true
      };
    }
    
    return { success: false, error: error.message };
  }
};

export const findUserByUsername = async (username) => {
  try {
    // Clean username (remove @ if present, convert to lowercase)
    const cleanUsername = username.replace('@', '').toLowerCase().trim();
    
    // Direct document lookup using username as document ID
    const userRef = doc(db, 'usernames', cleanUsername);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'Username not found' };
    }
    
    // Get the actual user data using the user ID stored in username document
    const userId = userDoc.data().userId;
    const actualUserRef = doc(db, 'users', userId);
    const actualUserDoc = await getDoc(actualUserRef);
    
    if (!actualUserDoc.exists()) {
      return { success: false, error: 'User data not found' };
    }
    
    return { 
      success: true, 
      data: { id: actualUserDoc.id, ...actualUserDoc.data() }
    };
  } catch (error) {
    console.error('Error finding user by username:', error);
    return { success: false, error: error.message };
  }
};

export const checkUsernameAvailability = async (username) => {
  try {
    const cleanUsername = username.replace('@', '').toLowerCase().trim();
    
    // Check if username is valid (alphanumeric + underscore, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(cleanUsername)) {
      return { 
        success: false, 
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
      };
    }
    
    const userRef = doc(db, 'usernames', cleanUsername);
    const userDoc = await getDoc(userRef);
    
    return { 
      success: true, 
      available: !userDoc.exists() 
    };
  } catch (error) {
    console.error('Error checking username availability:', error);
    return { success: false, error: error.message };
  }
};

export const createUsernameMapping = async (username, userId) => {
  try {
    const cleanUsername = username.replace('@', '').toLowerCase().trim();
    
    // Check availability first
    const availabilityCheck = await checkUsernameAvailability(cleanUsername);
    if (!availabilityCheck.success) {
      return availabilityCheck;
    }
    
    if (!availabilityCheck.available) {
      return { success: false, error: 'Username is already taken' };
    }
    
    // Create username mapping
    await setDoc(doc(db, 'usernames', cleanUsername), {
      userId: userId,
      createdAt: createTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error creating username mapping:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to manually create username for existing users (for testing)
export const addUsernameToExistingUser = async (userId, username) => {
  try {
    const cleanUsername = username.replace('@', '').toLowerCase().trim();
    
    // Check if user exists
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    // Create username mapping
    const usernameResult = await createUsernameMapping(cleanUsername, userId);
    if (!usernameResult.success) {
      return usernameResult;
    }
    
    // Update user profile with username
    await updateDoc(userRef, {
      username: cleanUsername,
      updatedAt: createTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding username to existing user:', error);
    return { success: false, error: error.message };
  }
};

export const findUsersByEmails = async (emails) => {
  try {
    const foundUsers = [];
    const notFoundEmails = [];
    
    for (const email of emails) {
      const result = await findUserByEmail(email);
      if (result.success) {
        foundUsers.push(result.data);
      } else {
        notFoundEmails.push(email);
      }
    }
    
    return {
      success: true,
      data: {
        foundUsers,
        notFoundEmails
      }
    };
  } catch (error) {
    console.error('Error finding users by emails:', error);
    return { success: false, error: error.message };
  }
};

export const getGroupsByInvitedEmail = async (userEmail) => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('invitedEmails', 'array-contains', userEmail),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const groups = [];
    
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: groups };
  } catch (error) {
    console.error('Error getting groups by invited email:', error);
    return { success: false, error: error.message };
  }
};

export const joinGroupByEmail = async (groupId, userId, userEmail) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      return { success: false, error: 'Group not found' };
    }
    
    const groupData = groupSnap.data();
    
    // Check if user's email is in invited emails
    if (!groupData.invitedEmails?.includes(userEmail)) {
      return { success: false, error: 'User not invited to this group' };
    }
    
    // Check if user is already a member
    if (groupData.members?.includes(userId)) {
      return { success: false, error: 'User is already a member' };
    }
    
    // Add user to group members
    const updatedMembers = [...(groupData.members || []), userId];
    const updatedMemberDetails = {
      ...groupData.memberDetails,
      [userId]: {
        email: userEmail,
        displayName: userEmail.split('@')[0], // Will be updated when user profile is available
        photoURL: '',
        joinedAt: new Date().toISOString()
      }
    };
    
    // Remove email from invited emails
    const updatedInvitedEmails = groupData.invitedEmails.filter(email => email !== userEmail);
    
    await updateDoc(groupRef, {
      members: updatedMembers,
      memberDetails: updatedMemberDetails,
      invitedEmails: updatedInvitedEmails,
      updatedAt: createTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error joining group by email:', error);
    return { success: false, error: error.message };
  }
};

// ============ GROUP OPERATIONS ============

export const createGroup = async (groupData) => {
  try {
    const validation = validateGroup(groupData);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const group = {
      ...groupData,
      totalExpenses: 0,
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    };

    const docRef = await addDoc(collection(db, 'groups'), group);
    return { success: true, id: docRef.id, data: { id: docRef.id, ...group } };
  } catch (error) {
    console.error('Error creating group:', error);
    return { success: false, error: error.message };
  }
};

export const getUserGroups = async (userId) => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const groups = [];
    
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by updatedAt in JavaScript instead of Firestore
    groups.sort((a, b) => {
      const aTime = a.updatedAt?.toDate?.() || new Date(0);
      const bTime = b.updatedAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
    
    return { success: true, data: groups };
  } catch (error) {
    console.error('Error getting user groups:', error);
    return { success: false, error: error.message };
  }
};

export const getGroupDetails = async (groupId) => {
  try {
    const docRef = doc(db, 'groups', groupId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Group not found' };
    }
  } catch (error) {
    console.error('Error getting group details:', error);
    return { success: false, error: error.message };
  }
};

export const updateGroup = async (groupId, updateData) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      ...updateData,
      updatedAt: createTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating group:', error);
    return { success: false, error: error.message };
  }
};

export const addGroupMember = async (groupId, userId, userDetails) => {
  try {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      return { success: false, error: 'Group not found' };
    }
    
    const groupData = groupSnap.data();
    const updatedMembers = [...groupData.members, userId];
    const updatedMemberDetails = {
      ...groupData.memberDetails,
      [userId]: userDetails
    };
    
    await updateDoc(groupRef, {
      members: updatedMembers,
      memberDetails: updatedMemberDetails,
      updatedAt: createTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding group member:', error);
    return { success: false, error: error.message };
  }
};

// ============ EXPENSE OPERATIONS ============

export const addExpense = async (expenseData) => {
  try {
    const validation = validateExpense(expenseData);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const expense = {
      ...expenseData,
      isSettled: false,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    };

    const docRef = await addDoc(collection(db, 'expenses'), expense);
    
    // Update group total expenses if it's a group expense
    if (expenseData.groupId) {
      const groupRef = doc(db, 'groups', expenseData.groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (groupSnap.exists()) {
        const currentTotal = groupSnap.data().totalExpenses || 0;
        await updateDoc(groupRef, {
          totalExpenses: currentTotal + expenseData.amount,
          updatedAt: createTimestamp()
        });
      }
    }
    
    return { success: true, id: docRef.id, data: { id: docRef.id, ...expense } };
  } catch (error) {
    console.error('Error adding expense:', error);
    return { success: false, error: error.message };
  }
};

export const addPersonalExpense = async (expenseData, userId) => {
  try {
    console.log('Adding personal expense for user:', userId);
    console.log('Expense data:', expenseData);
    
    // Create expense data for personal expense
    const personalExpenseData = {
      title: expenseData.title || 'Untitled Expense',
      description: expenseData.description || '',
      amount: parseFloat(expenseData.amount) || 0,
      currency: 'USD',
      category: expenseData.category?.id || 'misc',
      paidBy: userId,
      groupId: null, // Personal expense
      splitType: 'equal',
      splitDetails: {},
      receiptURL: '',
      date: expenseData.date || new Date(),
      createdBy: userId,
      participants: [userId], // Only the user for personal expenses
      isSettled: true // Personal expenses are always settled
    };

    console.log('Personal expense data to save:', personalExpenseData);

    const validation = validateExpense(personalExpenseData);
    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors);
      return { success: false, error: validation.errors.join(', ') };
    }

    const expense = {
      ...personalExpenseData,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    };

    console.log('Saving expense to Firestore...');
    const docRef = await addDoc(collection(db, 'expenses'), expense);
    console.log('Expense saved with ID:', docRef.id);
    
    return { success: true, id: docRef.id, data: { id: docRef.id, ...expense } };
  } catch (error) {
    console.error('Error adding personal expense:', error);
    return { success: false, error: error.message };
  }
};

export const getGroupExpenses = async (groupId) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const expenses = [];
    
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: expenses };
  } catch (error) {
    console.error('Error getting group expenses:', error);
    return { success: false, error: error.message };
  }
};

export const getUserExpenses = async (userId) => {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'expenses'),
      where('createdBy', '==', userId),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const expenses = [];
    
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by date in JavaScript instead of Firestore
    expenses.sort((a, b) => {
      const aDate = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return bDate - aDate; // Descending order (newest first)
    });
    
    return { success: true, data: expenses };
  } catch (error) {
    console.error('Error getting user expenses:', error);
    return { success: false, error: error.message };
  }
};

// ============ REAL-TIME LISTENERS ============

export const listenToUserGroups = (userId, callback) => {
  const q = query(
    collection(db, 'groups'),
    where('members', 'array-contains', userId),
    where('isActive', '==', true)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const groups = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by updatedAt in JavaScript instead of Firestore
    groups.sort((a, b) => {
      const aTime = a.updatedAt?.toDate?.() || new Date(0);
      const bTime = b.updatedAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
    
    callback(groups);
  }, (error) => {
    console.error('Error in groups listener:', error);
    callback([]);
  });
};

export const listenToGroupExpenses = (groupId, callback) => {
  const q = query(
    collection(db, 'expenses'),
    where('groupId', '==', groupId),
    orderBy('date', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const expenses = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    callback(expenses);
  }, (error) => {
    console.error('Error in expenses listener:', error);
    callback([]);
  });
};

export const listenToUserExpenses = (userId, callback) => {
  const q = query(
    collection(db, 'expenses'),
    where('participants', 'array-contains', userId),
    orderBy('date', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const expenses = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    callback(expenses);
  }, (error) => {
    console.error('Error in user expenses listener:', error);
    callback([]);
  });
};

// ============ BATCH OPERATIONS ============

export const batchUpdateExpenses = async (updates) => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      const expenseRef = doc(db, 'expenses', id);
      batch.update(expenseRef, {
        ...data,
        updatedAt: createTimestamp()
      });
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error in batch update:', error);
    return { success: false, error: error.message };
  }
};

// ============ ERROR HANDLING UTILITIES ============

export const handleFirestoreError = (error) => {
  console.error('Firestore Error:', error);
  
  switch (error.code) {
    case 'permission-denied':
      return 'You do not have permission to perform this action';
    case 'not-found':
      return 'The requested document was not found';
    case 'already-exists':
      return 'This document already exists';
    case 'resource-exhausted':
      return 'Too many requests. Please try again later';
    case 'unauthenticated':
      return 'Please sign in to continue';
    default:
      return error.message || 'An unexpected error occurred';
  }
};
