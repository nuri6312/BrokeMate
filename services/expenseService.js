// Expense Management Service
import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { validateExpense, createTimestamp, SPLIT_TYPES } from '../models/dataModels';

// Add expense to a group
export const addGroupExpense = async (expenseData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate expense data
    const validation = validateExpense(expenseData);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    // Calculate split details based on split type
    const splitDetails = calculateSplitDetails(
      expenseData.amount,
      expenseData.participants,
      expenseData.splitType,
      expenseData.customSplits
    );

    const expense = {
      ...expenseData,
      createdBy: currentUser.uid,
      splitDetails,
      isSettled: false,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    };

    // Add expense to database
    const docRef = await addDoc(collection(db, 'expenses'), expense);

    // Update group total expenses
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

// Calculate split details based on split type
export const calculateSplitDetails = (amount, participants, splitType, customSplits = {}) => {
  const splitDetails = {};
  
  switch (splitType) {
    case SPLIT_TYPES.EQUAL:
      const equalAmount = amount / participants.length;
      participants.forEach(participantId => {
        splitDetails[participantId] = {
          amount: Math.round(equalAmount * 100) / 100,
          percentage: Math.round((100 / participants.length) * 100) / 100
        };
      });
      break;
      
    case SPLIT_TYPES.EXACT:
      participants.forEach(participantId => {
        const customAmount = customSplits[participantId] || 0;
        splitDetails[participantId] = {
          amount: customAmount,
          percentage: Math.round((customAmount / amount) * 10000) / 100
        };
      });
      break;
      
    case SPLIT_TYPES.PERCENTAGE:
      participants.forEach(participantId => {
        const percentage = customSplits[participantId] || 0;
        splitDetails[participantId] = {
          amount: Math.round((amount * percentage / 100) * 100) / 100,
          percentage: percentage
        };
      });
      break;
      
    default:
      // Default to equal split
      const defaultAmount = amount / participants.length;
      participants.forEach(participantId => {
        splitDetails[participantId] = {
          amount: Math.round(defaultAmount * 100) / 100,
          percentage: Math.round((100 / participants.length) * 100) / 100
        };
      });
  }
  
  return splitDetails;
};

// Get expenses for a specific group (simplified query)
export const getGroupExpenses = async (groupId) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId)
    );

    const querySnapshot = await getDocs(q);
    const expenses = [];

    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });

    // Sort by date in JavaScript
    expenses.sort((a, b) => {
      const aDate = a.date?.toMillis?.() || 0;
      const bDate = b.date?.toMillis?.() || 0;
      return bDate - aDate; // Descending order
    });

    return { success: true, data: expenses };
  } catch (error) {
    console.error('Error getting group expenses:', error);
    return { success: false, error: error.message };
  }
};

// Get user's expenses across all groups (simplified query)
export const getUserExpenses = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const q = query(
      collection(db, 'expenses'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    const expenses = [];

    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });

    // Sort by date in JavaScript
    expenses.sort((a, b) => {
      const aDate = a.date?.toMillis?.() || 0;
      const bDate = b.date?.toMillis?.() || 0;
      return bDate - aDate; // Descending order
    });

    return { success: true, data: expenses };
  } catch (error) {
    console.error('Error getting user expenses:', error);
    return { success: false, error: error.message };
  }
};

// Update expense
export const updateExpense = async (expenseId, updateData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const expenseRef = doc(db, 'expenses', expenseId);
    const expenseSnap = await getDoc(expenseRef);

    if (!expenseSnap.exists()) {
      return { success: false, error: 'Expense not found' };
    }

    const expenseData = expenseSnap.data();

    // Check if current user created the expense
    if (expenseData.createdBy !== currentUser.uid) {
      return { success: false, error: 'Only expense creator can update the expense' };
    }

    // Recalculate split details if participants or amount changed
    if (updateData.amount || updateData.participants || updateData.splitType) {
      const splitDetails = calculateSplitDetails(
        updateData.amount || expenseData.amount,
        updateData.participants || expenseData.participants,
        updateData.splitType || expenseData.splitType,
        updateData.customSplits || {}
      );
      updateData.splitDetails = splitDetails;
    }

    await updateDoc(expenseRef, {
      ...updateData,
      updatedAt: createTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, error: error.message };
  }
};

// Delete expense
export const deleteExpense = async (expenseId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const expenseRef = doc(db, 'expenses', expenseId);
    const expenseSnap = await getDoc(expenseRef);

    if (!expenseSnap.exists()) {
      return { success: false, error: 'Expense not found' };
    }

    const expenseData = expenseSnap.data();

    // Check if current user created the expense
    if (expenseData.createdBy !== currentUser.uid) {
      return { success: false, error: 'Only expense creator can delete the expense' };
    }

    // Update group total expenses
    if (expenseData.groupId) {
      const groupRef = doc(db, 'groups', expenseData.groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (groupSnap.exists()) {
        const currentTotal = groupSnap.data().totalExpenses || 0;
        await updateDoc(groupRef, {
          totalExpenses: Math.max(0, currentTotal - expenseData.amount),
          updatedAt: createTimestamp()
        });
      }
    }

    await deleteDoc(expenseRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { success: false, error: error.message };
  }
};

// Listen to group expenses in real-time (simplified query)
export const listenToGroupExpenses = (groupId, callback) => {
  const q = query(
    collection(db, 'expenses'),
    where('groupId', '==', groupId)
  );

  return onSnapshot(q, (querySnapshot) => {
    const expenses = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by date in JavaScript
    expenses.sort((a, b) => {
      const aDate = a.date?.toMillis?.() || 0;
      const bDate = b.date?.toMillis?.() || 0;
      return bDate - aDate; // Descending order
    });
    
    callback(expenses);
  }, (error) => {
    console.error('Error in expenses listener:', error);
    callback([]);
  });
};

// Listen to user expenses in real-time (simplified query)
export const listenToUserExpenses = (callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    callback([]);
    return () => {};
  }

  // Simplified query - only filter by participants
  const q = query(
    collection(db, 'expenses'),
    where('participants', 'array-contains', currentUser.uid)
  );

  return onSnapshot(q, (querySnapshot) => {
    const expenses = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by date in JavaScript
    expenses.sort((a, b) => {
      const aDate = a.date?.toMillis?.() || 0;
      const bDate = b.date?.toMillis?.() || 0;
      return bDate - aDate; // Descending order
    });
    
    callback(expenses);
  }, (error) => {
    console.error('Error in user expenses listener:', error);
    callback([]);
  });
};