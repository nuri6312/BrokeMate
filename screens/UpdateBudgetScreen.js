import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { updateBudget, getCurrentMonthBudget } from '../services/budgetService';
import { updateDemoBudgetSpending } from '../services/budgetDemoService';

export default function UpdateBudgetScreen({ navigation, route }) {
  const { user, currentBudget } = route.params;
  const [amount, setAmount] = useState(currentBudget?.amount?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [budgetData, setBudgetData] = useState(currentBudget);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];



  useEffect(() => {
    // Load fresh budget data when screen opens
    loadCurrentBudget();
  }, []);

  const loadCurrentBudget = async () => {
    try {
      const result = await getCurrentMonthBudget(user.uid);
      if (result.success && result.data) {
        setBudgetData(result.data);
        setAmount(result.data.amount.toString());
      }
    } catch (error) {
      console.log('Error loading current budget:', error);
    }
  };

  const handleUpdateBudget = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount');
      return;
    }

    const newAmount = parseFloat(amount);
    if (newAmount === budgetData?.amount) {
      Alert.alert('No Changes', 'No changes were made to the budget');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        amount: newAmount,
        category: 'general', // Always use general for monthly budget
        remaining: newAmount - (budgetData?.spent || 0), // Recalculate remaining
        monthName: monthNames[currentMonth - 1]
      };

      // Try Firebase first
      let result = await updateBudget(budgetData.id, updateData);
      
      // If Firebase fails, try demo service
      if (!result.success) {
        console.log('Firebase update failed, trying demo service');
        result = await updateDemoBudgetSpending(user.uid, budgetData?.spent || 0);
      }

      if (result.success) {
        // Reload fresh data
        await loadCurrentBudget();
        
        Alert.alert(
          'Budget Updated!',
          `Your ${monthNames[currentMonth - 1]} budget has been updated to $${newAmount}.`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Navigate back and refresh the Activity screen
                navigation.goBack();
                // Trigger a refresh on the Activity screen
                if (navigation.getState().routes.length > 1) {
                  navigation.navigate('Activity', { refresh: true });
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getBudgetProgress = () => {
    if (!budgetData) return 0;
    return Math.min((budgetData.spent / parseFloat(amount || budgetData.amount)) * 100, 100);
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
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.title}>Update Budget</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Current Budget Overview */}
          {budgetData && (
            <View style={styles.currentBudgetCard}>
              <Text style={styles.currentBudgetTitle}>Current Budget</Text>
              <View style={styles.budgetStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Budget</Text>
                  <Text style={styles.statValue}>${budgetData.amount?.toFixed(2) || '0.00'}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Spent</Text>
                  <Text style={[styles.statValue, { color: '#ef4444' }]}>
                    ${budgetData.spent?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={[styles.statValue, { color: getBudgetColor() }]}>
                    ${budgetData.remaining?.toFixed(2) || '0.00'}
                  </Text>
                </View>
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
            </View>
          )}

          {/* Month Display */}
          <View style={styles.monthCard}>
            <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
            <Text style={styles.monthText}>
              {monthNames[currentMonth - 1]} {currentYear}
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Budget Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
            {amount && parseFloat(amount) !== budgetData?.amount && (
              <View style={styles.changeIndicator}>
                <Ionicons 
                  name={parseFloat(amount) > budgetData?.amount ? "trending-up" : "trending-down"} 
                  size={16} 
                  color={parseFloat(amount) > budgetData?.amount ? "#10b981" : "#ef4444"} 
                />
                <Text style={[
                  styles.changeText,
                  { color: parseFloat(amount) > budgetData?.amount ? "#10b981" : "#ef4444" }
                ]}>
                  {parseFloat(amount) > budgetData?.amount ? "Increase" : "Decrease"} of $
                  {Math.abs(parseFloat(amount) - budgetData?.amount).toFixed(2)}
                </Text>
              </View>
            )}
          </View>



          {/* Update Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Updating your monthly budget will recalculate your remaining amount based on current spending. 
              This budget applies to all your expenses for the month.
            </Text>
          </View>
        </ScrollView>

        {/* Update Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.updateButton, loading && styles.disabledButton]}
            onPress={handleUpdateBudget}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>Update Budget</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
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
  },
  backButton: {
    padding: wp('2%'),
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: '700',
    color: '#1f2937',
  },
  placeholder: {
    width: wp('10%'),
  },
  currentBudgetCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: wp('6%'),
    marginTop: hp('2%'),
    borderRadius: 12,
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentBudgetTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('1.5%'),
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
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
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1f2937',
  },
  progressContainer: {
    marginTop: hp('1%'),
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: hp('0.5%'),
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: wp('3.2%'),
    color: '#6b7280',
    textAlign: 'center',
  },
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: wp('6%'),
    marginTop: hp('2%'),
    paddingVertical: hp('2%'),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  monthText: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: wp('2%'),
  },
  section: {
    marginHorizontal: wp('6%'),
    marginTop: hp('3%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('1.5%'),
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#1f2937',
    marginRight: wp('2%'),
  },
  amountInput: {
    flex: 1,
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
    paddingHorizontal: wp('2%'),
  },
  changeText: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    marginLeft: wp('1%'),
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    marginHorizontal: wp('6%'),
    marginTop: hp('3%'),
    padding: wp('4%'),
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    flex: 1,
    fontSize: wp('3.8%'),
    color: '#1e40af',
    lineHeight: wp('5%'),
    marginLeft: wp('2%'),
  },
  buttonContainer: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  updateButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  updateButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#ffffff',
  },
});