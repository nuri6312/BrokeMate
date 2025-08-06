import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const categories = [
  { id: 'housing', name: 'Housing & Utilities', icon: 'home-outline', color: '#10b981' },
  { id: 'food', name: 'Food & Dining', icon: 'restaurant-outline', color: '#f59e0b' },
  { id: 'transport', name: 'Transportation', icon: 'car-outline', color: '#3b82f6' },
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
  // Check if we're in editing mode
  const isEditing = route?.params?.isEditing || false;
  const existingData = route?.params?.expenseData || {};

  const [amount, setAmount] = useState(existingData.amount || '');
  const [description, setDescription] = useState(existingData.description || '');
  const [selectedCategory, setSelectedCategory] = useState(existingData.category || null);
  const [selectedDate, setSelectedDate] = useState(existingData.date || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [splitType, setSplitType] = useState(existingData.splitType || 'equally');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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

  const handleSaveExpense = () => {
    const expenseData = {
      amount,
      description,
      category: selectedCategory,
      date: selectedDate,
      splitType
    };

    if (isEditing) {
      // TODO: Implement update expense logic
      console.log('Updating expense:', expenseData);
    } else {
      // TODO: Implement create expense logic
      console.log('Creating expense:', expenseData);
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
          {isEditing ? 'Edit Expense' : 'Add Expense'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Split With Section */}
        <View style={styles.splitSection}>
          <Text style={styles.splitTitle}>Split with</Text>

          {/* Group Member */}
          <View style={styles.groupMember}>
            <View style={styles.memberAvatar}>
              <Image
                source={{ uri: 'https://via.placeholder.com/40x40/10b981/ffffff?text=U' }}
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>Group Name</Text>
              <Text style={styles.memberSubtext}>Split equally</Text>
            </View>
          </View>

          {/* Split Options */}
          <View style={styles.splitOptions}>
            <TouchableOpacity
              style={[
                styles.splitOption,
                splitType === 'unequally' && styles.splitOptionActive
              ]}
              onPress={() => setSplitType('unequally')}
            >
              <Text style={[
                styles.splitOptionText,
                splitType === 'unequally' && styles.splitOptionTextActive
              ]}>
                Split Unequally
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.splitOption,
                styles.splitOptionPrimary,
                splitType === 'equally' && styles.splitOptionActive
              ]}
              onPress={() => setSplitType('equally')}
            >
              <Text style={[
                styles.splitOptionText,
                styles.splitOptionTextPrimary,
                splitType === 'equally' && styles.splitOptionTextActive
              ]}>
                Split Equally
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
  splitSection: {
    marginTop: hp('2%'),
    marginBottom: hp('3%'),
  },
  splitTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('2%'),
  },
  groupMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  memberAvatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('3%'),
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp('6%'),
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  memberSubtext: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
  },
  splitOptions: {
    flexDirection: 'row',
    gap: wp('3%'),
  },
  splitOption: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('6%'),
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitOptionPrimary: {
    backgroundColor: '#bfdbfe',
  },
  splitOptionActive: {
    backgroundColor: '#3b82f6',
  },
  splitOptionText: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#6b7280',
  },
  splitOptionTextPrimary: {
    color: '#3b82f6',
  },
  splitOptionTextActive: {
    color: '#ffffff',
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
    color: '#3b82f6',
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
    color: '#3b82f6',
    fontWeight: '500',
  },
  datePickerDone: {
    fontWeight: '600',
  },
  datePicker: {
    height: hp('25%'),
  },
});