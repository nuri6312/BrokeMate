// Budget Refresh Service - Handles monthly budget resets
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBudget, getCurrentMonthBudget } from './budgetService';
import { createEmptyBudgetData, getDemoBudget } from './budgetDemoService';

const LAST_REFRESH_KEY = 'last_budget_refresh_';
const AUTO_REFRESH_KEY = 'auto_refresh_enabled_';

// ============ MONTHLY REFRESH LOGIC ============

export const checkAndRefreshBudget = async (userId) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();
    
    // Only check on the 1st day of the month
    if (currentDay !== 1) {
      return { success: true, refreshed: false, message: 'Not first day of month' };
    }
    
    // Check if we already refreshed this month
    const lastRefreshKey = `${LAST_REFRESH_KEY}${userId}`;
    const lastRefresh = await AsyncStorage.getItem(lastRefreshKey);
    
    if (lastRefresh) {
      const lastRefreshDate = new Date(lastRefresh);
      const lastRefreshMonth = lastRefreshDate.getMonth() + 1;
      const lastRefreshYear = lastRefreshDate.getFullYear();
      
      // If we already refreshed this month, skip
      if (lastRefreshMonth === currentMonth && lastRefreshYear === currentYear) {
        return { success: true, refreshed: false, message: 'Already refreshed this month' };
      }
    }
    
    // Check if auto-refresh is enabled for this user
    const autoRefreshEnabled = await getAutoRefreshSetting(userId);
    if (!autoRefreshEnabled) {
      return { success: true, refreshed: false, message: 'Auto-refresh disabled' };
    }
    
    // Get previous month's budget to copy settings
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    // Try to get previous month's budget from Firebase
    let previousBudget = null;
    try {
      const prevBudgetResult = await getCurrentMonthBudget(userId);
      if (prevBudgetResult.success && prevBudgetResult.data) {
        previousBudget = prevBudgetResult.data;
      }
    } catch (error) {
      console.log('Could not get previous Firebase budget, checking demo data');
    }
    
    // If no Firebase budget, check demo data
    if (!previousBudget) {
      const demoBudgetResult = await getDemoBudget(userId);
      if (demoBudgetResult.success && demoBudgetResult.data) {
        previousBudget = demoBudgetResult.data;
      }
    }
    
    // Create new budget for current month
    let newBudgetResult;
    
    if (previousBudget && previousBudget.amount > 0) {
      // Copy previous month's budget amount
      const newBudgetData = {
        userId: userId,
        amount: previousBudget.amount,
        category: 'general', // Always use general for monthly budget
        month: currentMonth,
        year: currentYear,
        monthName: getMonthName(currentMonth)
      };
      
      // Try Firebase first
      newBudgetResult = await createBudget(newBudgetData);
      
      // If Firebase fails, create in demo storage
      if (!newBudgetResult.success) {
        newBudgetResult = await createEmptyBudgetData(userId);
        // Update the empty budget with previous amount
        if (newBudgetResult.success) {
          const updatedBudget = {
            ...newBudgetResult.data,
            amount: previousBudget.amount,
            remaining: previousBudget.amount,
            isActive: true
          };
          
          await AsyncStorage.setItem(
            `demo_budget_${userId}_${currentMonth}_${currentYear}`,
            JSON.stringify(updatedBudget)
          );
          
          newBudgetResult.data = updatedBudget;
        }
      }
    } else {
      // No previous budget or it was $0, create empty budget
      newBudgetResult = await createEmptyBudgetData(userId);
    }
    
    if (newBudgetResult.success) {
      // Mark this month as refreshed
      await AsyncStorage.setItem(lastRefreshKey, now.toISOString());
      
      return {
        success: true,
        refreshed: true,
        data: newBudgetResult.data,
        message: `Budget refreshed for ${getMonthName(currentMonth)} ${currentYear}`
      };
    }
    
    return { success: false, error: 'Failed to create new monthly budget' };
    
  } catch (error) {
    console.error('Error checking/refreshing budget:', error);
    return { success: false, error: error.message };
  }
};

// ============ AUTO-REFRESH SETTINGS ============

export const getAutoRefreshSetting = async (userId) => {
  try {
    const stored = await AsyncStorage.getItem(`${AUTO_REFRESH_KEY}${userId}`);
    return stored !== null ? JSON.parse(stored) : true; // Default to enabled
  } catch (error) {
    console.error('Error getting auto-refresh setting:', error);
    return true; // Default to enabled on error
  }
};

export const setAutoRefreshSetting = async (userId, enabled) => {
  try {
    await AsyncStorage.setItem(`${AUTO_REFRESH_KEY}${userId}`, JSON.stringify(enabled));
    return { success: true };
  } catch (error) {
    console.error('Error setting auto-refresh:', error);
    return { success: false, error: error.message };
  }
};

// ============ MANUAL REFRESH ============

export const manualRefreshBudget = async (userId) => {
  try {
    // Force refresh regardless of date
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Get current budget to copy amount
    let currentBudget = null;
    try {
      const currentBudgetResult = await getCurrentMonthBudget(userId);
      if (currentBudgetResult.success && currentBudgetResult.data) {
        currentBudget = currentBudgetResult.data;
      }
    } catch (error) {
      const demoBudgetResult = await getDemoBudget(userId);
      if (demoBudgetResult.success && demoBudgetResult.data) {
        currentBudget = demoBudgetResult.data;
      }
    }
    
    if (currentBudget && currentBudget.amount > 0) {
      // Reset spending to 0, keep same amount
      const refreshedBudget = {
        ...currentBudget,
        spent: 0,
        remaining: currentBudget.amount,
        updatedAt: now
      };
      
      // Save refreshed budget
      await AsyncStorage.setItem(
        `demo_budget_${userId}_${currentMonth}_${currentYear}`,
        JSON.stringify(refreshedBudget)
      );
      
      return {
        success: true,
        data: refreshedBudget,
        message: 'Budget manually refreshed - spending reset to $0'
      };
    }
    
    return { success: false, error: 'No active budget to refresh' };
    
  } catch (error) {
    console.error('Error manually refreshing budget:', error);
    return { success: false, error: error.message };
  }
};

// ============ HELPER FUNCTIONS ============

const getMonthName = (month) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month - 1];
};

// ============ CLEANUP ============

export const clearRefreshData = async (userId) => {
  try {
    await AsyncStorage.multiRemove([
      `${LAST_REFRESH_KEY}${userId}`,
      `${AUTO_REFRESH_KEY}${userId}`
    ]);
    return { success: true };
  } catch (error) {
    console.error('Error clearing refresh data:', error);
    return { success: false, error: error.message };
  }
};