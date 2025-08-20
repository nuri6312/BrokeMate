import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { createBudget, getCurrentMonthBudget } from '../services/budgetService';

export default function CreateBudgetScreen({ navigation, route }) {
  const { user } = route.params;
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const categories = [
    { id: 'general', name: 'General', icon: 'wallet-outline', color: '#3b82f6' },
    { id: 'food', name: 'Food & Dining', icon: 'restaurant-outline', color: '#ef4444' },
    { id: 'transport', name: 'Transportation', icon: 'car-outline', color: '#f59e0b' },
    { id: 'entertainment', name: 'Entertainment', icon: 'game-controller-outline', color: '#8b5cf6' },
    { id: 'shopping', name: 'Shopping', icon: 'bag-outline', color: '#ec4899' },
    { id: 'utilities', name: 'Utilities', icon: 'flash-outline', color: '#10b981' },
  ];

  const handleCreateBudget = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount');
      return;
    }

    setLoading(true);

    try {
      // Check if budget already exists for current month
      const existingBudget = await getCurrentMonthBudget(user.uid);
      if (existingBudget.success && existingBudget.data) {
        Alert.alert(
          'Budget Exists',
          'You already have a budget for this month. Would you like to update it?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Update', onPress: () => updateExistingBudget(existingBudget.data.id) }
          ]
        );
        setLoading(false);
        return;
      }

      const budgetData = {
        userId: user.uid,
        amount: parseFloat(amount),
        category: category,
        month: currentMonth,
        year: currentYear,
        monthName: monthNames[currentMonth - 1]
      };

      const result = await createBudget(budgetData);

      if (result.success) {
        Alert.alert(
          'Budget Created!',
          `Your ${monthNames[currentMonth - 1]} budget of $${amount} has been set successfully.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create budget');
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateExistingBudget = async (budgetId) => {
    // Implementation for updating existing budget would go here
    Alert.alert('Feature Coming Soon', 'Budget update functionality will be available soon');
  };

  const selectedCategory = categories.find(cat => cat.id === category);

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
            <Text style={styles.title}>Create Budget</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Month Display */}
          <View style={styles.monthCard}>
            <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
            <Text style={styles.monthText}>
              {monthNames[currentMonth - 1]} {currentYear}
            </Text>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Amount</Text>
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
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    category === cat.id && { ...styles.selectedCategory, borderColor: cat.color }
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                    <Ionicons name={cat.icon} size={24} color={cat.color} />
                  </View>
                  <Text style={[
                    styles.categoryName,
                    category === cat.id && { color: cat.color, fontWeight: '600' }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Budget Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              Your budget will track spending for the entire month. You'll receive notifications when you reach 90% and when you exceed your budget.
            </Text>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={handleCreateBudget}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating Budget...' : 'Create Budget'}
            </Text>
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
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: wp('6%'),
    marginTop: hp('3%'),
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
  categoriesScroll: {
    marginHorizontal: -wp('6%'),
    paddingHorizontal: wp('6%'),
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: wp('4%'),
    marginRight: wp('3%'),
    minWidth: wp('20%'),
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    borderWidth: 2,
  },
  categoryIcon: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  categoryName: {
    fontSize: wp('3.5%'),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: wp('4%'),
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
  createButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  createButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#ffffff',
  },
});