import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { addPersonalExpense } from '../services/databaseService';
import { addGroupExpense } from '../services/expenseService';
import { getUserGroups } from '../services/groupService';
import { SPLIT_TYPES } from '../models/dataModels';
import { addExpenseToBudget } from '../services/budgetService';
import { addExpenseToDemo } from '../services/budgetDemoService';
import { sendBudgetOverAlert, sendBudgetWarningAlert } from '../services/notificationService';
import { shouldSendNotification } from '../services/notificationSettingsService';

const categories = [
  { id: 'housing', name: 'Housing & Utilities', icon: 'home-outline', color: '#10b981' },
  { id: 'food', name: 'Food & Dining', icon: 'restaurant-outline', color: '#f59e0b' },
  { id: 'transport', name: 'Transportation', icon: 'car-outline', color: '#10b981' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film-outline', color: '#8b5cf6' },
  { id: 'shopping', name: 'Shopping', icon: 'bag-outline', color: '#ec4899' },
  { id: 'health', name: 'Health & Medical', icon: 'medical-outline', color: '#ef4444' },
  { id: 'education', name: 'Education', icon: 'school-outline', color: '#06b6d4' },
  { id: 'travel', name: 'Travel', icon: 'airplane-outline', color: '#84cc16' },
  { id: 'work', name: 'Work/Business', icon: 'briefcase-outline', color: '#6b7280' },
  { id: 'social', name: 'Social & Events', icon: 'people-outline', color: '#f97316' },
  { id: 'financial', name: 'Financial', icon: 'card-outline', color: '#14b8a6' },
  { id: 'misc', name: 'Miscellaneous', icon: 'ellipsis-horizontal-outline', color: '#64748b' },
];

export default function AddExpenseScreen({ navigation, onClose, user, route }) {
  // Check if we're in editing mode or group mode
  const isEditing = route?.params?.isEditing || false;
  const existingData = route?.params?.expenseData || {};
  const groupId = route?.params?.groupId;
  const group = route?.params?.group;
  const isGroupExpense = !!groupId;

  const [title, setTitle] = useState(existingData.title || '');
  const [amount, setAmount] = useState(existingData.amount || '');
  const [description, setDescription] = useState(existingData.description || '');
  const [selectedCategory, setSelectedCategory] = useState(existingData.category || null);
  const [selectedDate, setSelectedDate] = useState(existingData.date || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState(user?.uid || '');
  const [selectedParticipants, setSelectedParticipants] = useState(
    group?.members || [user?.uid || '']
  );

  // New states for expense splitting
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(group || null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [splitType, setSplitType] = useState(SPLIT_TYPES.EQUAL);
  const [customSplits, setCustomSplits] = useState({});
  const [showSplitModal, setShowSplitModal] = useState(false);

  // Load user groups on component mount
  useEffect(() => {
    loadUserGroups();
  }, []);

  const loadUserGroups = async () => {
    try {
      const result = await getUserGroups();
      if (result.success) {
        setUserGroups(result.data);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDate = (date) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleSaveExpense = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an expense title');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const currentGroup = selectedGroup || group;
    const isCurrentlyGroupExpense = isGroupExpense || !!selectedGroup;

    if (isCurrentlyGroupExpense && (!selectedPayer || selectedParticipants.length === 0)) {
      Alert.alert('Error', 'Please select who paid and participants');
      return;
    }

    // Validate custom splits for unequal splitting
    if (isCurrentlyGroupExpense && splitType === SPLIT_TYPES.EXACT) {
      const totalCustomSplit = Object.values(customSplits).reduce((sum, amt) => sum + (amt || 0), 0);
      const expenseAmount = parseFloat(amount);
      
      if (Math.abs(totalCustomSplit - expenseAmount) > 0.01) {
        Alert.alert('Error', `Split amounts must total $${expenseAmount.toFixed(2)}`);
        return;
      }
    }

    const expenseData = {
      title: title.trim(),
      amount: parseFloat(amount),
      description: description.trim(),
      category: selectedCategory.id,
      date: selectedDate,
    };

    if (isCurrentlyGroupExpense) {
      // Add group-specific data
      expenseData.groupId = currentGroup.id;
      expenseData.paidBy = selectedPayer;
      expenseData.participants = selectedParticipants;
      expenseData.splitType = splitType;
      if (splitType === SPLIT_TYPES.EXACT) {
        expenseData.customSplits = customSplits;
      }
    }

    if (isEditing) {
      // TODO: Implement update expense logic
      console.log('Updating expense:', expenseData);
      Alert.alert('Success', 'Expense updated successfully');
    } else {
      try {
        let result;

        if (isCurrentlyGroupExpense) {
          console.log('Adding group expense:', expenseData);
          result = await addGroupExpense(expenseData);
        } else {
          // Personal expense
          const userId = user?.uid || route?.params?.userId;
          if (!userId) {
            Alert.alert('Error', 'User not found. Please try again.');
            return;
          }
          console.log('Adding personal expense:', expenseData, userId);
          result = await addPersonalExpense(expenseData, userId);
        }

        console.log('Result:', result);

        if (result.success) {
          // Update budget if this is a personal expense
          if (!isCurrentlyGroupExpense) {
            try {
              const userId = user?.uid || route?.params?.userId;
              const expenseAmount = parseFloat(amount);
              
              // Try Firebase budget first
              let budgetResult = await addExpenseToBudget(userId, expenseAmount);
              
              // If Firebase fails, try demo budget
              if (!budgetResult.success) {
                budgetResult = await addExpenseToDemo(userId, expenseAmount);
              }
              
              // Send notifications if budget limits are reached and notifications are enabled
              if (budgetResult.success && budgetResult.data) {
                const { isOverBudget, percentageUsed, shouldNotify } = budgetResult.data;
                
                // Check if notifications are enabled for this user
                const shouldSendNotifications = await shouldSendNotification(userId, 'budgetAlerts');
                
                if (shouldNotify && shouldSendNotifications) {
                  if (isOverBudget) {
                    await sendBudgetOverAlert({
                      remaining: budgetResult.data.remaining,
                      spent: budgetResult.data.spent,
                      amount: budgetResult.data.spent - budgetResult.data.remaining
                    });
                  } else if (percentageUsed >= 90) {
                    await sendBudgetWarningAlert({
                      spent: budgetResult.data.spent,
                      remaining: budgetResult.data.remaining,
                      amount: budgetResult.data.spent + budgetResult.data.remaining
                    });
                  }
                }
              }
            } catch (budgetError) {
              console.log('Budget update failed (non-critical):', budgetError.message);
            }
          }
          
          Alert.alert('Success', 'Expense saved successfully');
        } else {
          Alert.alert('Error', result.error || 'Failed to save expense');
          return;
        }
      } catch (error) {
        console.error('Error saving expense:', error);
        Alert.alert('Error', 'Failed to save expense. Please try again.');
        return;
      }
    }

    // Navigate back to previous screen
    if (navigation) {
      navigation.goBack();
    } else if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (navigation) {
      navigation.goBack();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={wp('6%')} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Expense' : 
           isGroupExpense ? `Add to ${group?.name}` : 
           selectedGroup ? `Add to ${selectedGroup.name}` : 'Add Expense'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Expense Title"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <View style={styles.amountInputWrapper}>
            <TextInput
              style={styles.amountInput}
              placeholder="Amount"
              placeholderTextColor="#9ca3af"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Text style={styles.currencySymbol}>$</Text>
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Description"
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Category Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.categoryText, !selectedCategory && styles.placeholderText]}>
              {selectedCategory ? selectedCategory.name : 'Category'}
            </Text>
            <View style={styles.categoryIcon}>
              {selectedCategory ? (
                <View style={[styles.categoryIconCircle, { backgroundColor: selectedCategory.color }]}>
                  <Ionicons name={selectedCategory.icon} size={wp('4%')} color="#ffffff" />
                </View>
              ) : (
                <View style={styles.categoryIconCircle}>
                  <Ionicons name="grid-outline" size={wp('4%')} color="#ffffff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Date Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.dateInputWrapper}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(selectedDate)}
            </Text>
            <Ionicons name="calendar-outline" size={wp('5%')} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Group Selection */}
        {!isGroupExpense && (
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.groupButton}
              onPress={() => setShowGroupModal(true)}
            >
              <Text style={[styles.groupText, !selectedGroup && styles.placeholderText]}>
                {selectedGroup ? `Split with ${selectedGroup.name}` : 'Personal Expense (No Group)'}
              </Text>
              <Ionicons name="people-outline" size={wp('5%')} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        )}

        {/* Split Type Selection */}
        {(selectedGroup || isGroupExpense) && (
          <View style={styles.inputContainer}>
            <Text style={styles.sectionLabel}>How to split?</Text>
            <View style={styles.splitTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.splitTypeButton,
                  splitType === SPLIT_TYPES.EQUAL && styles.splitTypeButtonSelected
                ]}
                onPress={() => setSplitType(SPLIT_TYPES.EQUAL)}
              >
                <Text style={[
                  styles.splitTypeText,
                  splitType === SPLIT_TYPES.EQUAL && styles.splitTypeTextSelected
                ]}>
                  Equally
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.splitTypeButton,
                  splitType === SPLIT_TYPES.EXACT && styles.splitTypeButtonSelected
                ]}
                onPress={() => {
                  setSplitType(SPLIT_TYPES.EXACT);
                  setShowSplitModal(true);
                }}
              >
                <Text style={[
                  styles.splitTypeText,
                  splitType === SPLIT_TYPES.EXACT && styles.splitTypeTextSelected
                ]}>
                  Unequally
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Group Expense Options */}
        {(selectedGroup || isGroupExpense) && (
          <>
            {/* Who Paid */}
            <View style={styles.inputContainer}>
              <Text style={styles.sectionLabel}>Who paid?</Text>
              <View style={styles.participantsList}>
                {Object.entries((selectedGroup || group)?.memberDetails || {}).map(([memberId, memberInfo]) => {
                  console.log('Member Info:', memberId, memberInfo);
                  return (
                    <TouchableOpacity
                      key={memberId}
                      style={[
                        styles.participantItem,
                        selectedPayer === memberId && styles.participantItemSelected
                      ]}
                      onPress={() => setSelectedPayer(memberId)}
                    >
                      <Text style={styles.participantName}>{memberInfo?.name || memberInfo?.displayName || 'Unknown Member'}</Text>
                      {selectedPayer === memberId && (
                        <Ionicons name="checkmark-circle" size={wp('5%')} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Participants */}
            <View style={styles.inputContainer}>
              <Text style={styles.sectionLabel}>Split between</Text>
              <View style={styles.participantsList}>
                {Object.entries((selectedGroup || group)?.memberDetails || {}).map(([memberId, memberInfo]) => (
                  <TouchableOpacity
                    key={memberId}
                    style={[
                      styles.participantItem,
                      selectedParticipants.includes(memberId) && styles.participantItemSelected
                    ]}
                    onPress={() => {
                      if (selectedParticipants.includes(memberId)) {
                        const newParticipants = selectedParticipants.filter(id => id !== memberId);
                        setSelectedParticipants(newParticipants);
                        // Remove from custom splits if exists
                        const newCustomSplits = { ...customSplits };
                        delete newCustomSplits[memberId];
                        setCustomSplits(newCustomSplits);
                      } else {
                        setSelectedParticipants([...selectedParticipants, memberId]);
                      }
                    }}
                  >
                    <Text style={styles.participantName}>{memberInfo?.name || memberInfo?.displayName || 'Unknown Member'}</Text>
                    {selectedParticipants.includes(memberId) && (
                      <Ionicons name="checkmark-circle" size={wp('5%')} color="#10b981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Custom Split Preview for Unequal */}
            {splitType === SPLIT_TYPES.EXACT && selectedParticipants.length > 0 && (
              <View style={styles.inputContainer}>
                <View style={styles.splitPreviewHeader}>
                  <Text style={styles.sectionLabel}>Split Details</Text>
                  <TouchableOpacity
                    style={styles.editSplitButton}
                    onPress={() => setShowSplitModal(true)}
                  >
                    <Text style={styles.editSplitText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.splitPreviewList}>
                  {selectedParticipants.map(memberId => {
                    const memberInfo = (selectedGroup || group)?.memberDetails[memberId];
                    const splitAmount = customSplits[memberId] || 0;
                    return (
                      <View key={memberId} style={styles.splitPreviewItem}>
                        <Text style={styles.participantName}>{memberInfo?.name || memberInfo?.displayName || 'Unknown Member'}</Text>
                        <Text style={styles.splitAmount}>${splitAmount.toFixed(2)}</Text>
                      </View>
                    );
                  })}
                  <View style={styles.splitPreviewTotal}>
                    <Text style={styles.splitTotalLabel}>Total:</Text>
                    <Text style={styles.splitTotalAmount}>
                      ${Object.values(customSplits).reduce((sum, amt) => sum + (amt || 0), 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveExpense}>
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Update Expense' : 'Save Expense'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Ionicons name="close" size={wp('6%')} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Category</Text>
            <View style={styles.modalSpacer} />
          </View>

          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.categoriesContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  selectedCategory?.id === item.id && styles.categoryItemSelected
                ]}
                onPress={() => {
                  setSelectedCategory(item);
                  setShowCategoryModal(false);
                }}
              >
                <View style={[styles.categoryItemIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={wp('6%')} color="#ffffff" />
                </View>
                <Text style={styles.categoryItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Group Selection Modal */}
      <Modal
        visible={showGroupModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowGroupModal(false)}
            >
              <Ionicons name="close" size={wp('6%')} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Group</Text>
            <View style={styles.modalSpacer} />
          </View>

          <ScrollView style={styles.groupsList}>
            {/* Personal Expense Option */}
            <TouchableOpacity
              style={[
                styles.groupItem,
                !selectedGroup && styles.groupItemSelected
              ]}
              onPress={() => {
                setSelectedGroup(null);
                setSelectedParticipants([user?.uid || '']);
                setSelectedPayer(user?.uid || '');
                setSplitType(SPLIT_TYPES.EQUAL);
                setCustomSplits({});
                setShowGroupModal(false);
              }}
            >
              <View style={styles.groupItemIcon}>
                <Ionicons name="person-outline" size={wp('6%')} color="#10b981" />
              </View>
              <View style={styles.groupItemInfo}>
                <Text style={styles.groupItemName}>Personal Expense</Text>
                <Text style={styles.groupItemDescription}>No group splitting</Text>
              </View>
              {!selectedGroup && (
                <Ionicons name="checkmark-circle" size={wp('5%')} color="#10b981" />
              )}
            </TouchableOpacity>

            {/* User Groups */}
            {userGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupItem,
                  selectedGroup?.id === group.id && styles.groupItemSelected
                ]}
                onPress={() => {
                  setSelectedGroup(group);
                  setSelectedParticipants(group.members || []);
                  setSelectedPayer(user?.uid || '');
                  setSplitType(SPLIT_TYPES.EQUAL);
                  setCustomSplits({});
                  setShowGroupModal(false);
                }}
              >
                <View style={styles.groupItemIcon}>
                  <Ionicons name="people-outline" size={wp('6%')} color="#10b981" />
                </View>
                <View style={styles.groupItemInfo}>
                  <Text style={styles.groupItemName}>{group.name}</Text>
                  <Text style={styles.groupItemDescription}>
                    {group.members?.length || 0} members
                  </Text>
                </View>
                {selectedGroup?.id === group.id && (
                  <Ionicons name="checkmark-circle" size={wp('5%')} color="#10b981" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Custom Split Modal */}
      <Modal
        visible={showSplitModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSplitModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSplitModal(false)}
            >
              <Ionicons name="close" size={wp('6%')} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Custom Split</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={() => {
                const totalSplit = Object.values(customSplits).reduce((sum, amt) => sum + (amt || 0), 0);
                const expenseAmount = parseFloat(amount) || 0;
                
                if (Math.abs(totalSplit - expenseAmount) > 0.01) {
                  Alert.alert('Error', `Split amounts must total $${expenseAmount.toFixed(2)}`);
                  return;
                }
                setShowSplitModal(false);
              }}
            >
              <Text style={styles.modalSaveText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.customSplitContainer}>
            <Text style={styles.splitInstructions}>
              Enter the amount each person should pay. Total must equal ${parseFloat(amount || 0).toFixed(2)}
            </Text>
            
            {selectedParticipants.map(memberId => {
              const memberInfo = (selectedGroup || group)?.memberDetails[memberId];
              return (
                <View key={memberId} style={styles.customSplitItem}>
                  <Text style={styles.customSplitName}>{memberInfo?.name || memberInfo?.displayName || 'Unknown Member'}</Text>
                  <View style={styles.customSplitInputWrapper}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.customSplitInput}
                      placeholder="0.00"
                      value={customSplits[memberId]?.toString() || ''}
                      onChangeText={(text) => {
                        const numValue = parseFloat(text) || 0;
                        setCustomSplits(prev => ({
                          ...prev,
                          [memberId]: numValue
                        }));
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              );
            })}

            <View style={styles.splitSummary}>
              <View style={styles.splitSummaryRow}>
                <Text style={styles.splitSummaryLabel}>Total Split:</Text>
                <Text style={styles.splitSummaryAmount}>
                  ${Object.values(customSplits).reduce((sum, amt) => sum + (amt || 0), 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.splitSummaryRow}>
                <Text style={styles.splitSummaryLabel}>Expense Amount:</Text>
                <Text style={styles.splitSummaryAmount}>
                  ${parseFloat(amount || 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.splitSummaryRow}>
                <Text style={[
                  styles.splitSummaryLabel,
                  styles.splitDifference
                ]}>
                  Difference:
                </Text>
                <Text style={[
                  styles.splitSummaryAmount,
                  styles.splitDifference
                ]}>
                  ${(parseFloat(amount || 0) - Object.values(customSplits).reduce((sum, amt) => sum + (amt || 0), 0)).toFixed(2)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.datePickerButton, styles.datePickerDone]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}
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
  closeButton: {
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('3%'),
  },
  inputContainer: {
    marginBottom: hp('2%'),
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    height: hp('7%'),
  },
  amountInput: {
    flex: 1,
    fontSize: wp('4.5%'),
    color: '#1f2937',
    paddingVertical: 0,
  },
  currencySymbol: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#6b7280',
  },
  titleInput: {
    backgroundColor: '#e5e7eb',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    fontSize: wp('4.5%'),
    color: '#1f2937',
    height: hp('7%'),
  },
  descriptionInput: {
    backgroundColor: '#e5e7eb',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    fontSize: wp('4.5%'),
    color: '#1f2937',
    minHeight: hp('7%'),
    textAlignVertical: 'top',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e5e7eb',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    height: hp('7%'),
  },
  categoryText: {
    fontSize: wp('4.5%'),
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  categoryIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconCircle: {
    width: wp('8%'),
    height: wp('8%'),
    backgroundColor: '#6b7280',
    borderRadius: wp('4%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    height: hp('7%'),
  },
  dateText: {
    flex: 1,
    fontSize: wp('4.5%'),
    color: '#1f2937',
    paddingVertical: hp('1.5%'),
  },
  saveButton: {
    backgroundColor: '#bfdbfe',
    borderRadius: wp('6%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('2%'),
  },
  saveButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#10b981',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    padding: wp('1%'),
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  modalSpacer: {
    width: wp('8%'),
  },
  categoriesContainer: {
    padding: wp('6%'),
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    margin: wp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryItemSelected: {
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  categoryItemIcon: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('1%'),
  },
  categoryItemText: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: wp('4.5%'),
  },
  // Date picker styles
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: wp('4%'),
    borderTopRightRadius: wp('4%'),
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  datePickerButton: {
    fontSize: wp('4%'),
    color: '#10b981',
    fontWeight: '500',
  },
  datePickerDone: {
    fontWeight: '600',
  },
  datePicker: {
    height: hp('25%'),
  },
  // Group expense styles
  sectionLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('1%'),
  },
  participantsList: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('2%'),
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    marginBottom: hp('0.5%'),
  },
  participantItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  participantName: {
    fontSize: wp('4%'),
    color: '#000000',
    fontWeight: '600',
  },
  // Group selection styles
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e5e7eb',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    height: hp('7%'),
  },
  groupText: {
    fontSize: wp('4.5%'),
    color: '#1f2937',
  },
  groupsList: {
    flex: 1,
    paddingHorizontal: wp('6%'),
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginVertical: hp('0.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupItemSelected: {
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  groupItemIcon: {
    width: wp('12%'),
    height: wp('12%'),
    backgroundColor: '#f0fdf4',
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  groupItemInfo: {
    flex: 1,
  },
  groupItemName: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('0.5%'),
  },
  groupItemDescription: {
    fontSize: wp('3.5%'),
    color: '#6b7280',
  },
  // Split type styles
  splitTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('1%'),
  },
  splitTypeButton: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    borderRadius: wp('2%'),
  },
  splitTypeButtonSelected: {
    backgroundColor: '#10b981',
  },
  splitTypeText: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#6b7280',
  },
  splitTypeTextSelected: {
    color: '#ffffff',
  },
  // Split preview styles
  splitPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  editSplitButton: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    backgroundColor: '#10b981',
    borderRadius: wp('2%'),
  },
  editSplitText: {
    fontSize: wp('3.5%'),
    color: '#ffffff',
    fontWeight: '500',
  },
  splitPreviewList: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('3%'),
  },
  splitPreviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  splitAmount: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#1f2937',
  },
  splitPreviewTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp('1%'),
    marginTop: hp('1%'),
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
  },
  splitTotalLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  splitTotalAmount: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#10b981',
  },
  // Custom split modal styles
  modalSaveButton: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
  },
  modalSaveText: {
    fontSize: wp('4%'),
    color: '#10b981',
    fontWeight: '600',
  },
  customSplitContainer: {
    flex: 1,
    paddingHorizontal: wp('6%'),
  },
  splitInstructions: {
    fontSize: wp('3.5%'),
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
  },
  customSplitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginVertical: hp('0.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customSplitName: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  customSplitInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('3%'),
    width: wp('25%'),
  },
  customSplitInput: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#1f2937',
    paddingVertical: hp('1%'),
    textAlign: 'right',
  },
  splitSummary: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginTop: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  splitSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('0.5%'),
  },
  splitSummaryLabel: {
    fontSize: wp('4%'),
    color: '#6b7280',
  },
  splitSummaryAmount: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#1f2937',
  },
  splitDifference: {
    fontWeight: '600',
    color: '#ef4444',
  },
});