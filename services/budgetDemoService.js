// Demo Budget Service - Works without Firebase for testing
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_BUDGET_KEY = 'demo_budget_';
const DEMO_EXPENSES_KEY = 'demo_expenses_';

// Demo data for testing
const createDemoBudget = (userId, month, year) => ({
  id: `demo_${userId}_${month}_${year}`,
  userId,
  amount: 1000,
  spent: 750,
  remaining: 250,
  category: 'general',
  month,
  year,
  monthName: getMonthName(month),
  currency: 'USD',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

const getMonthName = (month) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month - 1];
};

export const createDemoBudgetData = async (userId) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const demoBudget = createDemoBudget(userId, currentMonth, currentYear);
    
    await AsyncStorage.setItem(
      `${DEMO_BUDGET_KEY}${userId}_${currentMonth}_${currentYear}`,
      JSON.stringify(demoBudget)
    );
    
    return { success: true, data: demoBudget };
  } catch (error) {
    console.error('Error creating demo budget:', error);
    return { success: false, error: error.message };
  }
};

export const getDemoBudget = async (userId) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const stored = await AsyncStorage.getItem(
      `${DEMO_BUDGET_KEY}${userId}_${currentMonth}_${currentYear}`
    );
    
    if (stored) {
      return { success: true, data: JSON.parse(stored) };
    }
    
    // Create demo budget if none exists
    return await createDemoBudgetData(userId);
  } catch (error) {
    console.error('Error getting demo budget:', error);
    return { success: false, error: error.message };
  }
};

export const updateDemoBudgetSpending = async (userId, newSpentAmount) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const key = `${DEMO_BUDGET_KEY}${userId}_${currentMonth}_${currentYear}`;
    const stored = await AsyncStorage.getItem(key);
    
    if (stored) {
      const budget = JSON.parse(stored);
      budget.spent = newSpentAmount;
      budget.remaining = budget.amount - newSpentAmount;
      budget.updatedAt = new Date();
      
      await AsyncStorage.setItem(key, JSON.stringify(budget));
      
      return {
        success: true,
        data: {
          spent: newSpentAmount,
          remaining: budget.remaining,
          isOverBudget: budget.remaining < 0
        }
      };
    }
    
    return { success: false, error: 'Budget not found' };
  } catch (error) {
    console.error('Error updating demo budget spending:', error);
    return { success: false, error: error.message };
  }
};

export const updateDemoBudget = async (userId, updateData) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const key = `${DEMO_BUDGET_KEY}${userId}_${currentMonth}_${currentYear}`;
    const stored = await AsyncStorage.getItem(key);
    
    if (stored) {
      const budget = JSON.parse(stored);
      
      // Update budget with new data
      const updatedBudget = {
        ...budget,
        ...updateData,
        updatedAt: new Date()
      };
      
      // Recalculate remaining if amount changed
      if (updateData.amount) {
        updatedBudget.remaining = updateData.amount - (budget.spent || 0);
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(updatedBudget));
      
      return {
        success: true,
        data: updatedBudget
      };
    }
    
    return { success: false, error: 'Budget not found' };
  } catch (error) {
    console.error('Error updating demo budget:', error);
    return { success: false, error: error.message };
  }
};

export const clearDemoData = async (userId) => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const demoKeys = keys.filter(key => 
      key.startsWith(DEMO_BUDGET_KEY) || key.startsWith(DEMO_EXPENSES_KEY)
    );
    
    await AsyncStorage.multiRemove(demoKeys);
    return { success: true };
  } catch (error) {
    console.error('Error clearing demo data:', error);
    return { success: false, error: error.message };
  }
};