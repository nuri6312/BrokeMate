import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { deleteExpense } from '../services/expenseService';
import { auth } from '../firebaseConfig';

export default function ExpenseDetailsScreen({ navigation, route }) {
  // Get expense data from route params
  const expense = route?.params?.expense;
  const group = route?.params?.group;
  const currentUser = auth.currentUser;

  if (!expense) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Expense not found</Text>
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

  const formatDate = (date) => {
    if (!date) return '';

    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryName = (categoryId) => {
    const categoryMap = {
      food: 'Food & Dining',
      transport: 'Transportation',
      entertainment: 'Entertainment',
      shopping: 'Shopping',
      health: 'Health & Medical',
      education: 'Education',
      travel: 'Travel',
      work: 'Work/Business',
      social: 'Social & Events',
      financial: 'Financial',
      housing: 'Housing & Utilities',
      misc: 'Miscellaneous'
    };
    return categoryMap[categoryId] || 'Other';
  };

  const handleEdit = () => {
    // Navigate to AddExpenseScreen with existing data for editing
    navigation.navigate('AddExpense', {
      isEditing: true,
      expenseData: {
        title: expense.title,
        amount: expense.amount.toString(),
        description: expense.description,
        category: {
          id: expense.category,
          name: getCategoryName(expense.category),
          icon: 'restaurant-outline',
          color: '#f59e0b'
        },
        date: expense.date.toDate ? expense.date.toDate() : new Date(expense.date),
      }
    });
  };

  const handleDelete = () => {
    // Check if current user can delete this expense
    if (!currentUser || expense.createdBy !== currentUser.uid) {
      Alert.alert('Error', 'You can only delete expenses you created');
      return;
    }

    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      const result = await deleteExpense(expense.id);
      
      if (result.success) {
        Alert.alert('Success', 'Expense deleted successfully', [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={wp('6%')} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
        {currentUser && expense.createdBy === currentUser.uid ? (
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={wp('5.5%')} color="#ef4444" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Title</Text>
              <Text style={styles.detailValue}>{expense.title}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>{formatCurrency(expense.amount)}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{getCategoryName(expense.category)}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(expense.date)}</Text>
            </View>

            {expense.description && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{expense.description}</Text>
              </View>
            )}

            {expense.groupId && expense.paidBy && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Paid by</Text>
                <Text style={styles.detailValue}>
                  {group?.memberDetails?.[expense.paidBy]?.name || 'Unknown'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Group/Personal Expense Info */}
        <View style={styles.section}>
          {expense.groupId ? (
            <>
              {/* Group Expense Info */}
              <Text style={styles.sectionTitle}>Split Details</Text>
              <View style={styles.groupExpenseNote}>
                <Ionicons name="people-outline" size={wp('5%')} color="#10b981" />
                <Text style={styles.groupExpenseText}>
                  Group expense {group?.name ? `in ${group.name}` : ''}
                </Text>
              </View>
              
              {/* Show split details if available */}
              {expense.splitDetails && (
                <View style={styles.splitDetailsContainer}>
                  {Object.entries(expense.splitDetails).map(([userId, splitInfo]) => {
                    const memberName = group?.memberDetails?.[userId]?.name || 'Unknown';
                    const isPayer = expense.paidBy === userId;
                    
                    return (
                      <View key={userId} style={styles.splitItem}>
                        <Text style={styles.splitMemberName}>
                          {memberName} {isPayer && '(paid)'}
                        </Text>
                        <Text style={styles.splitAmount}>
                          ${splitInfo.amount?.toFixed(2) || '0.00'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          ) : (
            <View style={styles.personalExpenseNote}>
              <Ionicons name="person-outline" size={wp('5%')} color="#6b7280" />
              <Text style={styles.personalExpenseText}>This is a personal expense</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {currentUser && expense.createdBy === currentUser.uid && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete Expense</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add some bottom padding for the floating button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Add Expense Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('AddExpense')}
      >
        <Ionicons name="add" size={wp('6%')} color="#ffffff" style={styles.floatingButtonIcon} />
        <Text style={styles.floatingButtonText}>Add Expense</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: wp('1%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSpacer: {
    width: wp('8%'),
  },
  headerActionButton: {
    padding: wp('2%'),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('3%'),
  },
  section: {
    marginBottom: hp('4%'),
  },
  sectionTitle: {
    fontSize: wp('6%'),
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: hp('2%'),
  },
  detailsGrid: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: wp('4%'),
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: wp('4%'),
    color: '#1f2937',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  groupTitle: {
    fontSize: wp('5.5%'),
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: hp('2%'),
  },
  participantsList: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    marginRight: wp('3%'),
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  participantPaid: {
    fontSize: wp('3.5%'),
    color: '#10b981',
    fontWeight: '500',
  },
  participantOwes: {
    fontSize: wp('3.5%'),
    color: '#ef4444',
    fontWeight: '500',
  },
  personalExpenseNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    borderLeftWidth: 4,
    borderLeftColor: '#6b7280',
  },
  personalExpenseText: {
    fontSize: wp('4%'),
    color: '#6b7280',
    marginLeft: wp('2%'),
    fontWeight: '500',
  },
  groupExpenseNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    marginBottom: hp('2%'),
  },
  groupExpenseText: {
    fontSize: wp('4%'),
    color: '#10b981',
    marginLeft: wp('2%'),
    fontWeight: '500',
  },
  splitDetailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  splitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  splitMemberName: {
    fontSize: wp('4%'),
    color: '#1f2937',
    fontWeight: '500',
  },
  splitAmount: {
    fontSize: wp('4%'),
    color: '#1f2937',
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: hp('2%'),
    gap: hp('1.5%'),
  },
  editButton: {
    backgroundColor: '#10b981',
    borderRadius: wp('6%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: wp('6%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('10%'),
  },
  errorText: {
    fontSize: wp('5%'),
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: hp('3%'),
  },
  backButtonText: {
    fontSize: wp('4.5%'),
    color: '#10b981',
    fontWeight: '600',
  },
  bottomPadding: {
    height: hp('10%'),
  },
  floatingButton: {
    position: 'absolute',
    bottom: hp('2%'),
    right: wp('2%'),
    backgroundColor: '#10b981',
    borderRadius: wp('8%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  floatingButtonIcon: {
    fontSize: wp('6%'),
    color: '#ffffff',
    marginRight: wp('2%'),
    fontWeight: 'bold',
  },
  floatingButtonText: {
    fontSize: wp('4.5%'),
    color: '#ffffff',
    fontWeight: '600',
  },
});