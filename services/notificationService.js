// Notification Service for Budget Alerts
import { Platform, Alert } from 'react-native';

// Disable notifications in Expo Go since they're not supported
const NOTIFICATIONS_ENABLED = false;

let Notifications = null;

// Only try to load notifications if not in Expo Go
if (NOTIFICATIONS_ENABLED) {
  try {
    Notifications = require('expo-notifications');
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.log('expo-notifications not available, notifications disabled');
    Notifications = null;
  }
}

// ============ NOTIFICATION SETUP ============

export const requestNotificationPermissions = async () => {
  try {
    if (!NOTIFICATIONS_ENABLED || !Notifications) {
      console.log('Notifications disabled for Expo Go compatibility');
      return { success: true }; // Return success to avoid breaking the app
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return { success: false, error: 'Notification permissions not granted' };
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('budget-alerts', {
        name: 'Budget Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return { success: false, error: error.message };
  }
};

// ============ BUDGET NOTIFICATIONS ============

export const sendBudgetOverAlert = async (budgetData) => {
  try {
    if (!NOTIFICATIONS_ENABLED || !Notifications) {
      // Show alert instead of push notification in Expo Go
      const overAmount = Math.abs(budgetData.remaining);
      Alert.alert(
        '🚨 Budget Exceeded!',
        `You've exceeded your monthly budget by $${overAmount.toFixed(2)}`,
        [{ text: 'OK' }]
      );
      return { success: true };
    }

    const overAmount = Math.abs(budgetData.remaining);
    const percentage = ((budgetData.spent / budgetData.amount) * 100).toFixed(1);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 Budget Exceeded!',
        body: `You've exceeded your monthly budget by $${overAmount.toFixed(2)} (${percentage}% used)`,
        data: {
          type: 'budget_over',
          budgetId: budgetData.id,
          amount: overAmount
        },
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending budget over alert:', error);
    return { success: false, error: error.message };
  }
};

export const sendBudgetWarningAlert = async (budgetData) => {
  try {
    if (!NOTIFICATIONS_ENABLED || !Notifications) {
      // Show alert instead of push notification in Expo Go
      const percentage = ((budgetData.spent / budgetData.amount) * 100).toFixed(1);
      const remaining = budgetData.remaining;
      
      Alert.alert(
        '⚠️ Budget Warning',
        `You've used ${percentage}% of your monthly budget. $${remaining.toFixed(2)} remaining.`,
        [{ text: 'OK' }]
      );
      return { success: true };
    }

    const percentage = ((budgetData.spent / budgetData.amount) * 100).toFixed(1);
    const remaining = budgetData.remaining;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Budget Warning',
        body: `You've used ${percentage}% of your monthly budget. $${remaining.toFixed(2)} remaining.`,
        data: {
          type: 'budget_warning',
          budgetId: budgetData.id,
          percentage: percentage
        },
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending budget warning alert:', error);
    return { success: false, error: error.message };
  }
};

export const sendBudgetMilestoneAlert = async (budgetData, milestone) => {
  try {
    const percentage = ((budgetData.spent / budgetData.amount) * 100).toFixed(1);
    
    let title, body;
    switch (milestone) {
      case 50:
        title = '📊 Budget Milestone';
        body = `You've reached 50% of your monthly budget. Keep tracking!`;
        break;
      case 75:
        title = '📈 Budget Alert';
        body = `You've used 75% of your monthly budget. Consider slowing down spending.`;
        break;
      case 90:
        title = '🔔 Budget Alert';
        body = `You've used 90% of your monthly budget. Only $${budgetData.remaining.toFixed(2)} left!`;
        break;
      default:
        return { success: false, error: 'Invalid milestone' };
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'budget_milestone',
          budgetId: budgetData.id,
          milestone: milestone
        },
        sound: 'default',
      },
      trigger: null,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending budget milestone alert:', error);
    return { success: false, error: error.message };
  }
};

// ============ NOTIFICATION MANAGEMENT ============

export const cancelBudgetNotifications = async (budgetId) => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.budgetId === budgetId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error canceling budget notifications:', error);
    return { success: false, error: error.message };
  }
};

export const clearAllNotifications = async () => {
  try {
    await Notifications.dismissAllNotificationsAsync();
    return { success: true };
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return { success: false, error: error.message };
  }
};

// ============ NOTIFICATION LISTENERS ============

export const addNotificationListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};