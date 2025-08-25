import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { 
  getCurrentMonthBudget, 
  checkBudgetStatus, 
  calculateMonthlySpending,
  listenToUserBudgets 
} from '../services/budgetService';
import { 
  requestNotificationPermissions, 
  sendBudgetOverAlert, 
  sendBudgetWarningAlert 
} from '../services/notificationService';
import { 
  getDemoBudget, 
  createEmptyBudgetData 
} from '../services/budgetDemoService';
import { 
  getNotificationSettings, 
  toggleNotifications, 
  shouldSendNotification 
} from '../services/notificationSettingsService';

export default function ActivityScreen({ navigation, user }) {
  const [currentBudget, setCurrentBudget] = useState(null);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    initializeNotifications();
    loadBudgetData();
    loadNotificationSettings();
    
    // Set up real-time listener for budgets with error handling
    let unsubscribe;
    try {
      unsubscribe = listenToUserBudgets(user.uid, (budgets) => {
        const current = budgets.find(b => b.month === currentMonth && b.year === currentYear);
        setCurrentBudget(current || null);
      });
    } catch (error) {
      console.log('Failed to set up budget listener:', error.message);
      unsubscribe = () => {}; // Empty function
    }

    return () => unsubscribe && unsubscribe();
  }, [user.uid]);

  // Handle refresh when returning from UpdateBudgetScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reload budget data when screen comes into focus
      loadBudgetData();
    });

    return unsubscribe;
  }, [navigation]);

  const initializeNotifications = async () => {
    await requestNotificationPermissions();
  };

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      
      // Try to get current month budget from Firebase
      let budgetResult = await getCurrentMonthBudget(user.uid);
      
      // If Firebase fails, check demo data
      if (!budgetResult.success || !budgetResult.data) {
        console.log('Firebase budget failed, checking demo data');
        budgetResult = await getDemoBudget(user.uid);
      }
      
      if (budgetResult.success && budgetResult.data && budgetResult.data.amount > 0) {
        setCurrentBudget(budgetResult.data);
        setMonthlySpending(budgetResult.data.spent || 0);
        
        // Create simple budget status
        const budget = budgetResult.data;
        const percentageUsed = (budget.spent / budget.amount) * 100;
        const isOverBudget = budget.spent > budget.amount;
        
        setBudgetStatus({
          hasActiveBudget: true,
          budget: budget,
          isOverBudget,
          percentageUsed,
          shouldNotify: isOverBudget || percentageUsed >= 90
        });
        
        // Send notifications if needed and enabled
        try {
          const shouldSend = await shouldSendNotification(user.uid, 'budgetAlerts');
          if (shouldSend) {
            if (isOverBudget) {
              await sendBudgetOverAlert(budget);
            } else if (percentageUsed >= 90) {
              await sendBudgetWarningAlert(budget);
            }
          }
        } catch (notificationError) {
          console.log('Notification error (non-critical):', notificationError.message);
        }
      } else {
        console.log('No active budget found - user needs to create one');
        setCurrentBudget(null);
        setMonthlySpending(0);
        setBudgetStatus({ hasActiveBudget: false });
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
      // Set empty state for new users
      setCurrentBudget(null);
      setMonthlySpending(0);
      setBudgetStatus({ hasActiveBudget: false });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBudgetData();
    setRefreshing(false);
  };

  const handleCreateBudget = () => {
    navigation.navigate('CreateBudget', { user });
  };

  const handleUpdateBudget = () => {
    if (currentBudget) {
      navigation.navigate('UpdateBudget', { user, currentBudget });
    } else {
      handleCreateBudget();
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const result = await getNotificationSettings(user.uid);
      if (result.success) {
        setNotificationsEnabled(result.data.enabled);
      }
    } catch (error) {
      console.log('Error loading notification settings:', error);
    }
  };

  const handleNotificationSettings = async () => {
    Alert.alert(
      'Notification Settings',
      `Budget notifications are currently ${notificationsEnabled ? 'enabled' : 'disabled'}. Would you like to ${notificationsEnabled ? 'disable' : 'enable'} them?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: notificationsEnabled ? 'Disable' : 'Enable',
          onPress: async () => {
            try {
              const result = await toggleNotifications(user.uid);
              if (result.success) {
                setNotificationsEnabled(result.data.enabled);
                Alert.alert(
                  'Settings Updated',
                  `Budget notifications have been ${result.data.enabled ? 'enabled' : 'disabled'}.`
                );
              } else {
                Alert.alert('Error', 'Failed to update notification settings');
              }
            } catch (error) {
              console.log('Error updating notification settings:', error);
              Alert.alert('Error', 'Failed to update notification settings');
            }
          }
        }
      ]
    );
  };

  const getBudgetProgress = () => {
    if (!currentBudget) return 0;
    return Math.min((monthlySpending / currentBudget.amount) * 100, 100);
  };

  const getBudgetColor = () => {
    const progress = getBudgetProgress();
    if (progress >= 100) return '#ef4444';
    if (progress >= 90) return '#f59e0b';
    if (progress >= 75) return '#eab308';
    return '#10b981';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Budget Tracker</Text>
            <Text style={styles.subtitle}>Manage your monthly spending</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Current Month Budget Card */}
        {currentBudget ? (
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <View style={styles.budgetInfo}>
                <Ionicons name="wallet-outline" size={24} color={getBudgetColor()} />
                <Text style={styles.budgetMonth}>
                  {monthNames[currentMonth - 1]} Budget
                </Text>
              </View>
              <Text style={[styles.budgetAmount, { color: getBudgetColor() }]}>
                ${currentBudget.amount.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${getBudgetProgress()}%`,
                      backgroundColor: getBudgetColor()
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {getBudgetProgress().toFixed(1)}% used
              </Text>
            </View>

            <View style={styles.budgetStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Spent</Text>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>
                  ${monthlySpending.toFixed(2)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={[styles.statValue, { color: getBudgetColor() }]}>
                  ${Math.max(0, currentBudget.amount - monthlySpending).toFixed(2)}
                </Text>
              </View>
            </View>

            {monthlySpending > currentBudget.amount && (
              <View style={styles.overBudgetAlert}>
                <Ionicons name="warning" size={20} color="#ef4444" />
                <Text style={styles.overBudgetText}>
                  You're ${(monthlySpending - currentBudget.amount).toFixed(2)} over budget!
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noBudgetCard}>
            <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
            <Text style={styles.noBudgetTitle}>No Budget Set</Text>
            <Text style={styles.noBudgetText}>
              Create a monthly budget to track your spending and get notifications
            </Text>
            <TouchableOpacity style={styles.createBudgetButton} onPress={handleCreateBudget}>
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.createBudgetText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={currentBudget ? handleUpdateBudget : handleCreateBudget}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons 
                  name={currentBudget ? "create-outline" : "add-circle-outline"} 
                  size={24} 
                  color="#3b82f6" 
                />
              </View>
              <Text style={styles.actionText}>
                {currentBudget ? 'Update Budget' : 'Create Budget'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleNotificationSettings}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons 
                  name={notificationsEnabled ? "notifications" : "notifications-off"} 
                  size={24} 
                  color="#6366f1" 
                />
              </View>
              <Text style={styles.actionText}>
                {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Budget Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
            <Text style={styles.tipText}>
              Set realistic budgets based on your average monthly spending. Review and adjust monthly for better results.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: wp('8.5%'),
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: hp('0.5%'),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: wp('4.3%'),
    color: '#6b7280',
    lineHeight: hp('2.8%'),
  },
  settingsButton: {
    padding: wp('2%'),
  },
  budgetCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: wp('6%'),
    marginTop: hp('3%'),
    borderRadius: 16,
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetMonth: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: wp('2%'),
  },
  budgetAmount: {
    fontSize: wp('6%'),
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: hp('2%'),
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: hp('1%'),
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: wp('3.5%'),
    color: '#6b7280',
    textAlign: 'center',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: wp('3.5%'),
    color: '#6b7280',
    marginBottom: hp('0.5%'),
  },
  statValue: {
    fontSize: wp('5%'),
    fontWeight: '700',
  },
  overBudgetAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: wp('3%'),
    borderRadius: 8,
    marginTop: hp('2%'),
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  overBudgetText: {
    fontSize: wp('3.8%'),
    color: '#dc2626',
    fontWeight: '500',
    marginLeft: wp('2%'),
  },
  noBudgetCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: wp('6%'),
    marginTop: hp('3%'),
    borderRadius: 16,
    padding: wp('8%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noBudgetTitle: {
    fontSize: wp('5.5%'),
    fontWeight: '700',
    color: '#1f2937',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  noBudgetText: {
    fontSize: wp('4%'),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: hp('2.5%'),
    marginBottom: hp('3%'),
  },
  createBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: 12,
  },
  createBudgetText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: wp('2%'),
  },
  section: {
    marginHorizontal: wp('6%'),
    marginTop: hp('4%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: hp('2%'),
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    width: wp('42%'),
    alignItems: 'center',
    padding: wp('4%'),
    borderRadius: 12,
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  actionText: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: wp('4%'),
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  tipText: {
    flex: 1,
    fontSize: wp('3.8%'),
    color: '#92400e',
    lineHeight: wp('5%'),
    marginLeft: wp('2%'),
  },
});