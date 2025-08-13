import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getGroupDetails } from '../services/groupService';
import { listenToGroupExpenses } from '../services/expenseService';
import { auth } from '../firebaseConfig';

export default function GroupDetailsScreen({ navigation, route }) {
  const { group } = route.params || { group: { name: 'Group', id: null } };
  
  const [groupData, setGroupData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load group data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (group?.id) {
        loadGroupData(group.id);
        
        // Set up real-time expense listener
        const unsubscribe = listenToGroupExpenses(group.id, (expensesData) => {
          console.log('Expenses loaded:', expensesData);
          setExpenses(expensesData);
          // Reload group data to refresh balances when expenses change
          loadGroupData(group.id);
        });

        return () => unsubscribe();
      }
    }, [group?.id])
  );

  const loadGroupData = async (groupId) => {
    try {
      setLoading(true);
      const result = await getGroupDetails(groupId);
      
      if (result.success) {
        setGroupData(result.data);
      } else {
        console.error('Failed to load group:', result.error);
        // Set fallback data if permission error
        if (result.error.includes('permissions')) {
          setGroupData({
            id: groupId,
            name: group?.name || 'Group',
            members: [auth.currentUser?.uid],
            memberDetails: {
              [auth.currentUser?.uid]: {
                name: auth.currentUser?.displayName || 'You',
                email: auth.currentUser?.email || ''
              }
            },
            expenses: [],
            balances: []
          });
        }
      }
    } catch (error) {
      console.error('Error loading group data:', error);
      // Set fallback data on any error
      setGroupData({
        id: groupId,
        name: group?.name || 'Group',
        members: [auth.currentUser?.uid],
        memberDetails: {
          [auth.currentUser?.uid]: {
            name: auth.currentUser?.displayName || 'You',
            email: auth.currentUser?.email || ''
          }
        },
        expenses: [],
        balances: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading group...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!groupData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Group not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={wp('6%')} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>{groupData.name}</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('GroupSettings', { group: groupData })}
        >
          <Ionicons name="settings-outline" size={wp('6%')} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Who owes whom section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who owes whom</Text>
          {groupData.balances && groupData.balances.length > 0 ? (
            groupData.balances.map((balance, index) => {
              const memberName = groupData.memberDetails[balance.userId]?.name || 'Unknown';
              const isPositive = balance.amount > 0;
              
              return (
                <View key={index} style={styles.balanceItem}>
                  <Text style={styles.personName}>{memberName}</Text>
                  <Text style={[
                    styles.balanceAmount,
                    isPositive ? styles.owedAmount : styles.oweAmount
                  ]}>
                    {isPositive ? 'Is owed' : 'Owes'} ${Math.abs(balance.amount).toFixed(2)}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noDataText}>All settled up!</Text>
          )}
        </View>

        {/* Expenses section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          {expenses && expenses.length > 0 ? (
            expenses.map((expense) => {
              const paidByName = groupData.memberDetails?.[expense.paidBy]?.name || 'Unknown';
              let expenseDate = 'Unknown date';
              
              try {
                if (expense.date?.toDate) {
                  expenseDate = expense.date.toDate().toLocaleDateString();
                } else if (expense.date) {
                  expenseDate = new Date(expense.date).toLocaleDateString();
                }
              } catch (error) {
                expenseDate = 'Unknown date';
              }
              
              return (
                <TouchableOpacity 
                  key={expense.id} 
                  style={styles.expenseItem}
                  onPress={() => navigation.navigate('ExpenseDetails', { expense, group: groupData })}
                >
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseTitle}>{expense.title || 'Untitled'}</Text>
                    <Text style={styles.expenseDate}>{expenseDate}</Text>
                    <Text style={styles.expensePaidBy}>Paid by {paidByName}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>
                    ${(expense.amount || 0).toFixed ? (expense.amount || 0).toFixed(2) : '0.00'}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noDataText}>No expenses yet</Text>
          )}
        </View>

        {/* Members section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Members</Text>
            <TouchableOpacity 
              style={styles.addMemberButton}
              onPress={() => navigation.navigate('AddMembers', { groupId: groupData.id })}
            >
              <Ionicons name="person-add" size={wp('5%')} color="#10b981" />
            </TouchableOpacity>
          </View>
          {Object.entries(groupData.memberDetails || {}).map(([memberId, memberInfo]) => (
            <View key={memberId} style={styles.memberItem}>
              <Text style={styles.memberName}>{memberInfo?.name || memberInfo?.displayName || 'Unknown Member'}</Text>
              {memberId === groupData.createdBy && (
                <Text style={styles.creatorBadge}>Creator</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={styles.addExpenseButton}
          onPress={() => navigation.navigate('AddExpense', { groupId: groupData.id, group: groupData })}
        >
          <Text style={styles.addExpenseButtonText}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settleButton}
          onPress={() => navigation.navigate('SettleBalances', { group: groupData })}
        >
          <Text style={styles.settleButtonText}>Settle Balances</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: wp('2%'),
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  settingsButton: {
    padding: wp('2%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
  },
  section: {
    marginTop: hp('3%'),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  addMemberButton: {
    padding: wp('2%'),
  },
  balanceItem: {
    marginBottom: hp('2%'),
  },
  personName: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('0.5%'),
  },
  balanceAmount: {
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  oweAmount: {
    color: '#ef4444',
  },
  owedAmount: {
    color: '#10b981',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('0.5%'),
  },
  expenseDate: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
    marginBottom: hp('0.3%'),
  },
  expensePaidBy: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
  },
  expenseAmount: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  memberItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberName: {
    fontSize: wp('4.5%'),
    color: '#000000',
    fontWeight: '600',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: wp('3%'),
  },
  addExpenseButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: hp('1.8%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
  },
  addExpenseButtonText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#ffffff',
  },
  settleButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: hp('1.8%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
  },
  settleButtonText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
  },
  errorText: {
    fontSize: wp('5%'),
    color: '#ef4444',
    marginBottom: hp('2%'),
  },
  noDataText: {
    fontSize: wp('4%'),
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: hp('2%'),
  },
  creatorBadge: {
    fontSize: wp('3.5%'),
    color: '#10b981',
    fontWeight: '500',
  },
});