// Firebase Firestore Database Service
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
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Users Collection
export const createUser = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), userData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUser = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Expenses Collection
export const addExpense = async (expenseData) => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expenseData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserExpenses = async (userId) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const expenses = [];
    
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: expenses };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateExpense = async (expenseId, updateData) => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await updateDoc(expenseRef, {
      ...updateData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Groups Collection (for splitting expenses)
export const createGroup = async (groupData) => {
  try {
    const docRef = await addDoc(collection(db, 'groups'), {
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserGroups = async (userId) => {
  try {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);
    const groups = [];
    
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: groups };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time listeners
export const listenToUserExpenses = (userId, callback) => {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const expenses = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    callback(expenses);
  });
};