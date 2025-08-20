// Budget Management Service
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
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { createTimestamp, validateBudget } from '../models/dataModels';

// ============ BUDGET OPERATIONS ============

export const createBudget = async (budgetData) => {
  try {
    const validation = validateBudget(budgetData);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const budget = {
      ...budgetData,
      spent: 0,
      remaining: budgetData.amount,
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    };

    const docRef = await addDoc(collection(db, 'budgets'), budget);
    return { success: true, id: docRef.id, data: { id: docRef.id, ...budget } };
  } catch (error) {
    console.error('Error creating budget:', error);
    return { success: false, error: error.message };
  }
};

export const getUserBudgets = async (userId) => {
  try {
    // Simplified query
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const budgets = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Filter active budgets in JavaScript
      if (data.isActive === true) {
        budgets.push({ id: doc.id, ...data });
      }
    });
    
    // Sort by month/year
    budgets.sort((a, b) => {
      const aDate = new Date(a.year, a.month - 1);
      const bDate = new Date(b.year, b.month - 1);
      return bDate - aDate;
    });
    
    return { success: true, data: budgets };
  } catch (error) {
    console.error('Error getting user budgets:', error);
    
    // Return empty array if permission denied
    if (error.code === 'permission-denied') {
      console.log('Permission denied, returning empty budgets array');
      return { success: true, data: [] };
    }
    
    return { success: false, error: error.message };
  }
};

export const getCurrentMonthBudget = async (userId) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Simplified query to avoid permission issues
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Filter in JavaScript to avoid compound index requirements
    let currentBudget = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.month === currentMonth && 
          data.year === currentYear && 
          data.isActive === true) {
        currentBudget = { id: doc.id, ...data };
      }
    });
    
    return { success: true, data: currentBudget };
  } catch (error) {
    console.error('Error getting current month budget:', error);
    
    // Return null budget if there are permission issues
    if (error.code === 'permission-denied') {
      console.log('Permission denied, returning null budget');
      return { success: true, data: null };
    }
    
    return { success: false, error: error.message };
  }
};

export const updateBudgetSpending = async (budgetId, newSpentAmount) => {
  try {
    const budgetRef = doc(db, 'budgets', budgetId);
    const budgetSnap = await getDoc(budgetRef);
    
    if (!budgetSnap.exists()) {
      return { success: false, error: 'Budget not found' };
    }
    
    const budgetData = budgetSnap.data();
    const remaining = budgetData.amount - newSpentAmount;
    
    await updateDoc(budgetRef, {
      spent: newSpentAmount,
      remaining: remaining,
      updatedAt: createTimestamp()
    });
    
    return { 
      success: true, 
      data: { 
        spent: newSpentAmount, 
        remaining: remaining,
        isOverBudget: remaining < 0
      }
    };
  } catch (error) {
    console.error('Error updating budget spending:', error);
    return { success: false, error: error.message };
  }
};

export const calculateMonthlySpending = async (userId, month, year) => {
  try {
    // Get start and end of the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    // Use a simpler query without compound indexes
    const q = query(
      collection(db, 'expenses'),
      where('createdBy', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    let totalSpent = 0;
    
    querySnapshot.forEach((doc) => {
      const expense = doc.data();
      const expenseDate = expense.date?.toDate ? expense.date.toDate() : new Date(expense.date);
      
      // Filter by date in JavaScript instead of Firestore
      if (expenseDate >= startDate && expenseDate <= endDate) {
        totalSpent += expense.amount || 0;
      }
    });
    
    return { success: true, data: totalSpent };
  } catch (error) {
    console.error('Error calculating monthly spending:', error);
    
    // Handle permission errors gracefully
    if (error.code === 'permission-denied') {
      console.log('Permission denied for expenses query, returning 0');
      return { success: true, data: 0 };
    }
    
    return { success: false, error: error.message };
  }
};

export const updateBudget = async (budgetId, updateData) => {
  try {
    const budgetRef = doc(db, 'budgets', budgetId);
    await updateDoc(budgetRef, {
      ...updateData,
      updatedAt: createTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating budget:', error);
    return { success: false, error: error.message };
  }
};

export const deleteBudget = async (budgetId) => {
  try {
    const budgetRef = doc(db, 'budgets', budgetId);
    await updateDoc(budgetRef, {
      isActive: false,
      updatedAt: createTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting budget:', error);
    return { success: false, error: error.message };
  }
};

// ============ BUDGET TRACKING ============

export const checkBudgetStatus = async (userId) => {
  try {
    const currentBudgetResult = await getCurrentMonthBudget(userId);
    if (!currentBudgetResult.success || !currentBudgetResult.data) {
      return { success: true, data: { hasActiveBudget: false } };
    }
    
    const budget = currentBudgetResult.data;
    const now = new Date();
    
    // Calculate current month spending
    const spendingResult = await calculateMonthlySpending(userId, now.getMonth() + 1, now.getFullYear());
    if (!spendingResult.success) {
      return spendingResult;
    }
    
    const currentSpent = spendingResult.data;
    const remaining = budget.amount - currentSpent;
    const isOverBudget = remaining < 0;
    const percentageUsed = (currentSpent / budget.amount) * 100;
    
    // Update budget with current spending
    await updateBudgetSpending(budget.id, currentSpent);
    
    return {
      success: true,
      data: {
        hasActiveBudget: true,
        budget: {
          ...budget,
          spent: currentSpent,
          remaining: remaining
        },
        isOverBudget,
        percentageUsed,
        shouldNotify: isOverBudget || percentageUsed >= 90
      }
    };
  } catch (error) {
    console.error('Error checking budget status:', error);
    return { success: false, error: error.message };
  }
};

// ============ REAL-TIME LISTENERS ============

export const listenToUserBudgets = (userId, callback) => {
  try {
    // Simplified query without compound where clauses
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const budgets = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter active budgets in JavaScript
        if (data.isActive === true) {
          budgets.push({ id: doc.id, ...data });
        }
      });
      
      // Sort by month/year
      budgets.sort((a, b) => {
        const aDate = new Date(a.year, a.month - 1);
        const bDate = new Date(b.year, b.month - 1);
        return bDate - aDate;
      });
      
      callback(budgets);
    }, (error) => {
      console.error('Error in budgets listener:', error);
      
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for budgets listener, returning empty array');
      }
      
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up budgets listener:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};