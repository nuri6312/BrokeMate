import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getUserExpenses } from '../services/databaseService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function ExpenseScreen({ user, navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [user]);

  // Refresh expenses when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadExpenses();
    }, [user])
  );

  const loadExpenses = async () => {
    if (!user?.uid) {
      console.log('No user ID found');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Loading expenses for user:', user.uid);
      const result = await getUserExpenses(user.uid);
      
      if (result.success) {
        console.log('Loaded expenses:', result.data.length);
        setExpenses(result.data);
      } else {
        console.error('Failed to load expenses:', result.error);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getCategoryIcon = (categoryId) => {
    const categoryMap = {
      food: 'restaurant-outline',
      transport: 'car-outline',
      entertainment: 'film-outline',
      shopping: 'bag-outline',
      health: 'medical-outline',
      education: 'school-outline',
      travel: 'airplane-outline',
      work: 'briefcase-outline',
      social: 'people-outline',
      financial: 'card-outline',
      housing: 'home-outline',
      misc: 'ellipsis-horizontal-outline'
    };
    return categoryMap[categoryId] || 'ellipsis-horizontal-outline';
  };

  const renderExpenseItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.expenseItem}
      onPress={() => navigation?.navigate('ExpenseDetails', { expense: item })}
    >
      <View style={styles.expenseHeader}>
        <View style={styles.expenseLeft}>
          <View style={styles.categoryIcon}>
            <Ionicons 
              name={getCategoryIcon(item.category)} 
              size={wp('5%')} 
              color="#3b82f6" 
            />
          </View>
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseTitle}>{item.title}</Text>
            <Text style={styles.expenseDescription}>{item.description}</Text>
          </View>
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>{formatAmount(item.amount)}</Text>
          <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.subtitle}>Track your personal spending</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading expenses...</Text>
          </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={wp('20%')} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptySubtitle}>Use the + button to add your first expense</Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onRefresh={loadExpenses}
            refreshing={loading}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation?.navigate('AddExpense', { userId: user?.uid })}
      >
        <Ionicons name="add" size={wp('7%')} color="#ffffff" />
      </TouchableOpacity>



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? hp('5.5%') : StatusBar.currentHeight || 0,
  },
  header: {
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

  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: wp('6%'),
  },
  expenseItem: {
    backgroundColor: '#ffffff',
    padding: wp('4%'),
    borderRadius: 12,
    marginBottom: hp('2%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  expenseDescription: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
    lineHeight: wp('5%'),
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  expenseDate: {
    fontSize: wp('3.5%'),
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp('20%'),
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#6b7280',
    marginTop: hp('2%'),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp('15%'),
    paddingHorizontal: wp('10%'),
  },
  emptyTitle: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#1f2937',
    marginTop: hp('3%'),
    marginBottom: hp('1%'),
  },
  emptySubtitle: {
    fontSize: wp('4%'),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: wp('6%'),
  },
  floatingButton: {
    position: 'absolute',
    bottom: hp('3%'),
    right: wp('6%'),
    width: wp('14%'),
    height: wp('14%'),
    backgroundColor: '#3b82f6',
    borderRadius: wp('7%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

});
