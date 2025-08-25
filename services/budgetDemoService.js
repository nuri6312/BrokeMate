// Demo Budget Service - Works without Firebase for testing
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_BUDGET_KEY = 'demo_budget_';
const DEMO_EXPENSES_KEY = 'demo_expenses_';

// Create empty budget for new users
const createEmptyBudget = (userId, month, year) => ({
  id: `demo_${userId}_${month}_${year}`,
  userId,
  amount: 0,
  spent: 0,
  remaining: 0,
  category: 'general',
  month,
  year,
  monthName: getMonthName(month),
  currency: 'USD',
  isActive: false, // Inactive until user sets a budget
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

export const createEmptyBudgetData = async (userId) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const emptyBudget = createEmptyBudget(userId, currentMonth, currentYear);

    await AsyncStorage.setItem(
      `${DEMO_BUDGET_KEY}${userId}_${currentMonth}_${currentYear}`,
      JSON.stringify(emptyBudget)
    );

    return { success: true, data: emptyBudget };
  } catch (error) {
    console.error('Error creating empty budget:', error);
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
      const budget = JSON.parse(stored);
      // Only return budget if it has been set by user (amount > 0)
      if (budget.amount > 0) {
        return { success: true, data: budget };
      }
    }

    // Return null for new users - no budget set
    return { success: true, data: null };
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

export const addExpenseToDemo = async (userId, expenseAmount) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const key = `${DEMO_BUDGET_KEY}${userId}_${currentMonth}_${currentYear}`;
    const stored = await AsyncStorage.getItem(key);

    if (stored) {
      const budget = JSON.parse(stored);

      // Only update if budget is active (amount > 0)
      if (budget.amount > 0) {
        budget.spent = (budget.spent || 0) + expenseAmount;
        budget.remaining = budget.amount - budget.spent;
        budget.updatedAt = new Date();

        await AsyncStorage.setItem(key, JSON.stringify(budget));

        return {
          success: true,
          data: {
            spent: budget.spent,
            remaining: budget.remaining,
            isOverBudget: budget.remaining < 0,
            percentageUsed: (budget.spent / budget.amount) * 100
          }
        };
      }
    }

    return { success: true, data: null }; // No active budget
  } catch (error) {
    console.error('Error adding expense to demo budget:', error);
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