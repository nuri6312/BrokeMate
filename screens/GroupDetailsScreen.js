import React, { useState } from 'react';
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

export default function GroupDetailsScreen({ navigation, route }) {
  const { group } = route.params || { group: { name: 'Apartment' } };
  
  const [balances] = useState([
    { id: '1', name: 'Liam', amount: 12.50, type: 'owe' },
    { id: '2', name: 'Noah', amount: 12.50, type: 'owe' },
    { id: '3', name: 'Ethan', amount: 25, type: 'owed' },
  ]);

  const [expenses] = useState([
    {
      id: '1',
      title: 'Groceries',
      amount: 50,
      date: '2024-01-20',
      paidBy: 'Liam',
    },
    {
      id: '2',
      title: 'Utilities',
      amount: 75,
      date: '2024-01-15',
      paidBy: 'Noah',
    },
    {
      id: '3',
      title: 'Rent',
      amount: 1500,
      date: '2024-01-10',
      paidBy: 'Ethan',
    },
  ]);

  const [members] = useState([
    { id: '1', name: 'Liam' },
    { id: '2', name: 'Noah' },
    { id: '3', name: 'Ethan' },
  ]);

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
        <Text style={styles.title}>{group.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Who owes whom section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who owes whom</Text>
          {balances.map((balance) => (
            <View key={balance.id} style={styles.balanceItem}>
              <Text style={styles.personName}>{balance.name}</Text>
              <Text style={[
                styles.balanceAmount,
                balance.type === 'owe' ? styles.oweAmount : styles.owedAmount
              ]}>
                {balance.type === 'owe' ? 'You owe' : 'You are owed'} ${balance.amount}
              </Text>
            </View>
          ))}
        </View>

        {/* Expenses section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          {expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>{expense.title}</Text>
                <Text style={styles.expenseDate}>{expense.date}</Text>
                <Text style={styles.expensePaidBy}>Paid by {expense.paidBy}</Text>
              </View>
              <Text style={styles.expenseAmount}>${expense.amount}</Text>
            </View>
          ))}
        </View>

        {/* Members section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members</Text>
          {members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <Text style={styles.memberName}>{member.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={styles.addExpenseButton}
          onPress={() => navigation.navigate('AddExpense', { groupId: group.id })}
        >
          <Text style={styles.addExpenseButtonText}>Add Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settleButton}>
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
  placeholder: {
    width: wp('10%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
  },
  section: {
    marginTop: hp('3%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('2%'),
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
    color: '#1f2937',
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
    backgroundColor: '#3b82f6',
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
});