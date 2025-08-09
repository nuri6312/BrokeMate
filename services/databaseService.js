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
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const groups = [];
    
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
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
    const q = query(
      collection(db, 'expenses'),
      where('participants', 'array-contains', userId),
      orderBy('date', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const expenses = [];
    
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
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
    where('isActive', '==', true),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const groups = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
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
