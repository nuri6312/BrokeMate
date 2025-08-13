import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { calculateGroupBalances } from '../services/groupService';
import { addGroupExpense } from '../services/expenseService';
import { auth } from '../firebaseConfig';

export default function SettleBalancesScreen({ navigation, route }) {
  const { group } = route.params || {};
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    if (group?.id) {
      loadBalances();
    }
  }, [group?.id]);

  const loadBalances = async () => {
    try {
      setLoading(true);
      console.log('Loading balances for group:', group.id);
      console.log('Group members:', group.members);
      
      const groupBalances = await calculateGroupBalances(group.id, group.members);
      console.log('Calculated balances:', groupBalances);
      
      setBalances(groupBalances);
      
      // Calculate optimal settlements using the same balance data
      const optimalSettlements = calculateOptimalSettlements(groupBalances, group.memberDetails);
      console.log('Calculated settlements:', optimalSettlements);
      
      setSettlements(optimalSettlements);
    } catch (error) {
      console.error('Error loading balances:', error);
      // Set empty arrays on error to avoid inconsistent state
      setBalances([]);
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate optimal settlements to minimize number of transactions
  const calculateOptimalSettlements = (balances, memberDetails) => {
    if (!balances || balances.length === 0) {
      console.log('No balances to calculate settlements for');
      return [];
    }

    console.log('Calculating settlements from balances:', balances);

    const settlements = [];
    // Create copies to avoid mutating original data
    const creditors = balances
      .filter(b => b.amount > 0.01)
      .map(b => ({ ...b }))
      .sort((a, b) => b.amount - a.amount);
    
    const debtors = balances
      .filter(b => b.amount < -0.01)
      .map(b => ({ ...b }))
      .sort((a, b) => a.amount - b.amount);

    console.log('Creditors:', creditors);
    console.log('Debtors:', debtors);

    let i = 0, j = 0;
    
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      
      const settleAmount = Math.min(creditor.amount, Math.abs(debtor.amount));
      
      if (settleAmount > 0.01) { // Only show settlements over 1 cent
        settlements.push({
          from: debtor.userId,
          fromName: memberDetails[debtor.userId]?.name || 'Unknown',
          to: creditor.userId,
          toName: memberDetails[creditor.userId]?.name || 'Unknown',
          amount: settleAmount
        });
      }
      
      creditor.amount -= settleAmount;
      debtor.amount += settleAmount;
      
      if (creditor.amount < 0.01) i++;
      if (Math.abs(debtor.amount) < 0.01) j++;
    }
    
    console.log('Final settlements:', settlements);
    return settlements;
  };

  const handleSettlePayment = async (settlement) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Check if current user is involved in this settlement
    if (settlement.from !== currentUser.uid && settlement.to !== currentUser.uid) {
      Alert.alert('Error', 'You can only settle payments you are involved in');
      return;
    }

    Alert.alert(
      'Confirm Settlement',
      `Record that ${settlement.fromName} paid ${settlement.toName} $${settlement.amount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => recordSettlement(settlement)
        }
      ]
    );
  };

  const recordSettlement = async (settlement) => {
    try {
      // Create a settlement expense (negative amount to balance out)
      const settlementExpense = {
        title: `Settlement: ${settlement.fromName} → ${settlement.toName}`,
        amount: settlement.amount,
        description: `Settlement payment from ${settlement.fromName} to ${settlement.toName}`,
        category: 'financial',
        date: new Date(),
        groupId: group.id,
        paidBy: settlement.from,
        participants: [settlement.to],
        splitType: 'exact',
        customSplits: {
          [settlement.to]: settlement.amount
        },
        isSettlement: true
      };

      const result = await addGroupExpense(settlementExpense);
      
      if (result.success) {
        Alert.alert('Success', 'Settlement recorded successfully!');
        // Reload balances to sync both sections
        await loadBalances();
      } else {
        Alert.alert('Error', result.error || 'Failed to record settlement');
      }
    } catch (error) {
      console.error('Error recording settlement:', error);
      Alert.alert('Error', 'Failed to record settlement');
    }
  };

  const handleSettleAll = () => {
    Alert.alert(
      'Settle All Balances',
      'This will mark all balances as settled. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Settle All', 
          style: 'destructive',
          onPress: () => settleAllBalances()
        }
      ]
    );
  };

  const settleAllBalances = async () => {
    try {
      // Record all settlements
      for (const settlement of settlements) {
        await recordSettlement(settlement);
      }
      
      Alert.alert('Success', 'All balances have been settled!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error settling all balances:', error);
      Alert.alert('Error', 'Failed to settle all balances');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating balances...</Text>
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
        <Text style={styles.title}>Settle Balances</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadBalances}
          disabled={loading}
        >
          <Ionicons name="refresh" size={wp('5%')} color="#10b981" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settlements.length === 0 ? (
          <View style={styles.settledContainer}>
            <Ionicons name="checkmark-circle" size={wp('20%')} color="#10b981" />
            <Text style={styles.settledTitle}>All Settled Up!</Text>
            <Text style={styles.settledSubtitle}>
              Everyone in this group is even. No payments needed.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Suggested Settlements</Text>
              <Text style={styles.sectionSubtitle}>
                These payments will settle all balances with the minimum number of transactions
              </Text>
            </View>

            {settlements.map((settlement, index) => (
              <View key={index} style={styles.settlementItem}>
                <View style={styles.settlementInfo}>
                  <Text style={styles.settlementText}>
                    <Text style={styles.payerName}>{settlement.fromName}</Text>
                    <Text style={styles.owesText}> owes </Text>
                    <Text style={styles.payeeName}>{settlement.toName}</Text>
                  </Text>
                  <Text style={styles.settlementAmount}>
                    ${settlement.amount.toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.settleButton}
                  onPress={() => handleSettlePayment(settlement)}
                >
                  <Text style={styles.settleButtonText}>Record Payment</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.settleAllButton}
              onPress={handleSettleAll}
            >
              <Text style={styles.settleAllButtonText}>Settle All Balances</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Current Balances Section - Always show for transparency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Balances</Text>
          <Text style={styles.sectionSubtitle}>
            Individual balance for each member in this group
          </Text>
          
          {group.members && group.members.length > 0 ? (
            group.members.map((memberId) => {
              const memberName = group.memberDetails[memberId]?.name || 'Unknown';
              const memberBalance = balances.find(b => b.userId === memberId);
              const amount = memberBalance ? memberBalance.amount : 0;
              const isPositive = amount > 0.01;
              const isNegative = amount < -0.01;
              
              return (
                <View key={memberId} style={styles.balanceItem}>
                  <Text style={styles.memberName}>{memberName}</Text>
                  <Text style={[
                    styles.balanceAmount,
                    isPositive ? styles.owedAmount : isNegative ? styles.oweAmount : styles.settledAmount
                  ]}>
                    {isPositive ? '+' : ''}${Math.abs(amount).toFixed(2)}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noMembersText}>No members found</Text>
          )}
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
  backButton: {
    padding: wp('2%'),
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  refreshButton: {
    padding: wp('2%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
  },
  section: {
    marginTop: hp('3%'),
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('0.5%'),
  },
  sectionSubtitle: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
    lineHeight: wp('5%'),
  },
  settlementItem: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settlementInfo: {
    marginBottom: hp('2%'),
  },
  settlementText: {
    fontSize: wp('4.2%'),
    marginBottom: hp('0.5%'),
  },
  payerName: {
    fontWeight: '600',
    color: '#ef4444',
  },
  owesText: {
    color: '#6b7280',
  },
  payeeName: {
    fontWeight: '600',
    color: '#10b981',
  },
  settlementAmount: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#1f2937',
  },
  settleButton: {
    backgroundColor: '#10b981',
    borderRadius: wp('2%'),
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
  },
  settleButtonText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#ffffff',
  },
  settleAllButton: {
    backgroundColor: '#10b981',
    borderRadius: wp('3%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('4%'),
  },
  settleAllButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#ffffff',
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: wp('4.2%'),
    fontWeight: '500',
    color: '#1f2937',
  },
  balanceAmount: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
  },
  owedAmount: {
    color: '#10b981',
  },
  oweAmount: {
    color: '#ef4444',
  },
  settledAmount: {
    color: '#6b7280',
  },
  noMembersText: {
    fontSize: wp('4%'),
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: hp('2%'),
  },
  settledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp('15%'),
    paddingHorizontal: wp('10%'),
  },
  settledTitle: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#1f2937',
    marginTop: hp('3%'),
    marginBottom: hp('1%'),
  },
  settledSubtitle: {
    fontSize: wp('4%'),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: wp('6%'),
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
});