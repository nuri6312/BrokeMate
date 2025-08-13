import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, StatusBar, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getUserGroups, calculateUserBalanceInGroup } from '../services/groupService';
import { getUserExpenses } from '../services/expenseService';
import { auth } from '../firebaseConfig';

export default function DashboardScreen({ user, navigation }) {
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);

  // Load dashboard data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserGroups(),
        loadUserExpenses()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserGroups = async () => {
    try {
      const result = await getUserGroups();
      if (result.success) {
        setGroups(result.data);
        
        // Calculate total balance across all groups
        let total = 0;
        for (const group of result.data) {
          if (group.userBalance) {
            total += group.userBalance;
          }
        }
        setTotalBalance(total);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadUserExpenses = async () => {
    try {
      const result = await getUserExpenses();
      if (result.success) {
        setExpenses(result.data);
        
        // Calculate monthly spending (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTotal = result.data.reduce((total, expense) => {
          const expenseDate = expense.date?.toDate ? expense.date.toDate() : new Date(expense.date);
          if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
            // Only count expenses where user participated
            if (expense.splitDetails && expense.splitDetails[auth.currentUser?.uid]) {
              return total + (expense.splitDetails[auth.currentUser.uid].amount || 0);
            } else if (!expense.groupId) {
              // Personal expense
              return total + expense.amount;
            }
          }
          return total;
        }, 0);
        
        setMonthlySpending(monthlyTotal);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getRecentExpenses = () => {
    return expenses.slice(0, 3); // Show last 3 expenses
  };

  const getGroupsWithBalances = () => {
    return groups.filter(group => Math.abs(group.userBalance || 0) > 0.01).slice(0, 3);
  };

  const formatCurrency = (amount) => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  const getMonthName = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[new Date().getMonth()];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={wp('6%')} color="#6b7280" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overview Cards */}
        <View style={styles.overviewContainer}>
          <TouchableOpacity 
            style={[styles.overviewCard, styles.balanceCard]}
            onPress={() => navigation.navigate('Groups')}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="wallet-outline" size={wp('6%')} color="#10b981" />
            </View>
            <Text style={styles.cardLabel}>Total Balance</Text>
            <Text style={[styles.cardAmount, totalBalance >= 0 ? styles.positiveAmount : styles.negativeAmount]}>
              {totalBalance >= 0 ? '+' : ''}{formatCurrency(totalBalance)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.overviewCard, styles.spendingCard]}
            onPress={() => navigation.navigate('Expenses')}
          >
            <View style={styles.cardIcon}>
              <MaterialIcons name="trending-up" size={wp('6%')} color="#10b981" />
            </View>
            <Text style={styles.cardLabel}>{getMonthName()} Spending</Text>
            <Text style={styles.cardAmount}>{formatCurrency(monthlySpending)}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Expenses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {getRecentExpenses().length > 0 ? (
            getRecentExpenses().map((expense) => {
              const expenseDate = expense.date?.toDate ? expense.date.toDate() : new Date(expense.date);
              const daysAgo = Math.floor((new Date() - expenseDate) / (1000 * 60 * 60 * 24));
              
              return (
                <TouchableOpacity 
                  key={expense.id}
                  style={styles.expenseItem}
                  onPress={() => navigation.navigate('ExpenseDetails', { expense })}
                >
                  <View style={styles.expenseIcon}>
                    <Ionicons 
                      name={expense.groupId ? "people-outline" : "person-outline"} 
                      size={wp('5%')} 
                      color="#6b7280" 
                    />
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseTitle}>{expense.title}</Text>
                    <Text style={styles.expenseSubtitle}>
                      {expense.groupId ? 'Group expense' : 'Personal expense'}
                    </Text>
                  </View>
                  <View style={styles.expenseRight}>
                    <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                    <Text style={styles.expenseDate}>
                      {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={wp('12%')} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No recent expenses</Text>
              <TouchableOpacity 
                style={styles.addExpenseButton}
                onPress={() => navigation.navigate('AddExpense')}
              >
                <Text style={styles.addExpenseButtonText}>Add your first expense</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Group Balances Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Group Balances</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Groups')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {getGroupsWithBalances().length > 0 ? (
            getGroupsWithBalances().map((group) => {
              const balance = group.userBalance || 0;
              const isOwed = balance > 0;
              
              return (
                <TouchableOpacity 
                  key={group.id}
                  style={styles.groupItem}
                  onPress={() => navigation.navigate('GroupDetails', { group })}
                >
                  <View style={styles.groupIcon}>
                    <Ionicons name="people-outline" size={wp('5%')} color="#6b7280" />
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupTitle}>{group.name}</Text>
                    <Text style={styles.groupMemberCount}>
                      {group.members?.length || 0} member{group.members?.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.groupRight}>
                    <Text style={styles.groupAmount}>{formatCurrency(balance)}</Text>
                    <Text style={[styles.groupStatus, isOwed ? styles.groupStatusOwed : styles.groupStatusOwe]}>
                      {isOwed ? "You're owed" : "You owe"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={wp('12%')} color="#9ca3af" />
              <Text style={styles.emptyStateText}>All settled up!</Text>
              <TouchableOpacity 
                style={styles.addGroupButton}
                onPress={() => navigation.navigate('NewGroup')}
              >
                <Text style={styles.addGroupButtonText}>Create a group</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AddExpense')}
            >
              <Ionicons name="add-circle-outline" size={wp('6%')} color="#10b981" />
              <Text style={styles.quickActionText}>Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('NewGroup')}
            >
              <Ionicons name="people-outline" size={wp('6%')} color="#10b981" />
              <Text style={styles.quickActionText}>New Group</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Groups')}
            >
              <Ionicons name="calculator-outline" size={wp('6%')} color="#f59e0b" />
              <Text style={styles.quickActionText}>Settle Up</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: wp('4%'),
    color: '#6b7280',
    marginTop: hp('0.5%'),
  },
  settingsButton: {
    padding: wp('2%'),
  },

  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
  },
  section: {
    marginBottom: hp('3%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: wp('3.8%'),
    color: '#10b981',
    fontWeight: '500',
  },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetIcon: {
    width: wp('12%'),
    height: wp('12%'),
    backgroundColor: '#f3f4f6',
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  budgetIconText: {
    fontSize: wp('6%'),
    color: '#6b7280',
  },
  budgetInfo: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: wp('4%'),
    color: '#6b7280',
    marginBottom: hp('0.5%'),
  },
  budgetAmount: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#10b981',
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentIcon: {
    width: wp('10%'),
    height: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  paymentIconText: {
    fontSize: wp('5%'),
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: wp('4.2%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  paymentAmount: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
  },
  paymentDue: {
    fontSize: wp('3.5%'),
    color: '#9ca3af',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  groupIcon: {
    width: wp('10%'),
    height: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  groupIconText: {
    fontSize: wp('5%'),
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: wp('4.2%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  groupAmount: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
  },
  groupStatus: {
    fontSize: wp('3.5%'),
    color: '#ef4444',
    fontWeight: '500',
  },
  groupStatusOwed: {
    fontSize: wp('3.5%'),
    color: '#10b981',
    fontWeight: '500',
  },
  groupStatusOwe: {
    fontSize: wp('3.5%'),
    color: '#ef4444',
    fontWeight: '500',
  },
  groupRight: {
    alignItems: 'flex-end',
  },
  groupMemberCount: {
    fontSize: wp('3.5%'),
    color: '#9ca3af',
  },
  // Overview Cards
  overviewContainer: {
    flexDirection: 'row',
    gap: wp('3%'),
    marginBottom: hp('3%'),
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  spendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  cardIcon: {
    width: wp('12%'),
    height: wp('12%'),
    backgroundColor: '#f8fafc',
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  cardLabel: {
    fontSize: wp('3.5%'),
    color: '#6b7280',
    marginBottom: hp('0.5%'),
    textAlign: 'center',
  },
  cardAmount: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#1f2937',
  },
  positiveAmount: {
    color: '#10b981',
  },
  negativeAmount: {
    color: '#ef4444',
  },
  // Expense Items
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  expenseIcon: {
    width: wp('10%'),
    height: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: wp('4.2%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  expenseSubtitle: {
    fontSize: wp('3.5%'),
    color: '#6b7280',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  expenseDate: {
    fontSize: wp('3.2%'),
    color: '#9ca3af',
  },
  // Empty States
  emptyState: {
    alignItems: 'center',
    paddingVertical: hp('4%'),
    paddingHorizontal: wp('6%'),
  },
  emptyStateText: {
    fontSize: wp('4%'),
    color: '#6b7280',
    marginTop: hp('1%'),
    marginBottom: hp('2%'),
    textAlign: 'center',
  },
  addExpenseButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('6%'),
  },
  addExpenseButtonText: {
    color: '#ffffff',
    fontSize: wp('3.8%'),
    fontWeight: '500',
  },
  addGroupButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('6%'),
  },
  addGroupButtonText: {
    color: '#ffffff',
    fontSize: wp('3.8%'),
    fontWeight: '500',
  },
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('3%'),
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: wp('3.5%'),
    color: '#1f2937',
    fontWeight: '500',
    marginTop: hp('1%'),
    textAlign: 'center',
  },
});