// Notification Settings Service
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings_';

// ============ NOTIFICATION SETTINGS ============

export const getNotificationSettings = async (userId) => {
  try {
    const stored = await AsyncStorage.getItem(`${NOTIFICATION_SETTINGS_KEY}${userId}`);
    if (stored !== null) {
      return { success: true, data: JSON.parse(stored) };
    }
    
    // Default settings for new users
    const defaultSettings = {
      budgetAlerts: true,
      overBudgetAlerts: true,
      milestoneAlerts: true,
      enabled: true
    };
    
    return { success: true, data: defaultSettings };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return { success: false, error: error.message };
  }
};

export const saveNotificationSettings = async (userId, settings) => {
  try {
    await AsyncStorage.setItem(
      `${NOTIFICATION_SETTINGS_KEY}${userId}`, 
      JSON.stringify(settings)
    );
    return { success: true };
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return { success: false, error: error.message };
  }
};

export const toggleNotifications = async (userId) => {
  try {
    const currentSettings = await getNotificationSettings(userId);
    if (!currentSettings.success) {
      return currentSettings;
    }
    
    const newSettings = {
      ...currentSettings.data,
      enabled: !currentSettings.data.enabled
    };
    
    const saveResult = await saveNotificationSettings(userId, newSettings);
    if (saveResult.success) {
      return { success: true, data: newSettings };
    }
    
    return saveResult;
  } catch (error) {
    console.error('Error toggling notifications:', error);
    return { success: false, error: error.message };
  }
};

export const updateNotificationSetting = async (userId, settingKey, value) => {
  try {
    const currentSettings = await getNotificationSettings(userId);
    if (!currentSettings.success) {
      return currentSettings;
    }
    
    const newSettings = {
      ...currentSettings.data,
      [settingKey]: value
    };
    
    const saveResult = await saveNotificationSettings(userId, newSettings);
    if (saveResult.success) {
      return { success: true, data: newSettings };
    }
    
    return saveResult;
  } catch (error) {
    console.error('Error updating notification setting:', error);
    return { success: false, error: error.message };
  }
};

// ============ NOTIFICATION CHECKING ============

export const shouldSendNotification = async (userId, notificationType = 'budgetAlerts') => {
  try {
    const settings = await getNotificationSettings(userId);
    if (!settings.success) {
      return true; // Default to sending notifications if settings can't be loaded
    }
    
    const { enabled, [notificationType]: specificSetting } = settings.data;
    
    // Check both global enabled state and specific notification type
    return enabled && (specificSetting !== false);
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return true; // Default to sending notifications on error
  }
};

// ============ CLEANUP ============

export const clearNotificationSettings = async (userId) => {
  try {
    await AsyncStorage.removeItem(`${NOTIFICATION_SETTINGS_KEY}${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error clearing notification settings:', error);
    return { success: false, error: error.message };
  }
};