import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ExpenseScreen({ user }) {
  const [expenses, setExpenses] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: '',
    groupName: '',
    splitType: 'Split equally',
  });

  const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'];

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) {
      Alert.alert('Error', 'Please fill in amount and description');
      return;
    }

    const expense = {
      id: Date.now().toString(),
      amount: newExpense.amount.startsWith('$') ? newExpense.amount : `$${newExpense.amount}`,
      description: newExpense.description,
      category: newExpense.category,
      date: newExpense.date || new Date().toISOString().split('T')[0],
      groupName: newExpense.groupName,
      splitType: newExpense.splitType,
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({
      amount: '',
      description: '',
      category: 'Food',
      date: '',
      groupName: '',
      splitType: '',
    });
    setModalVisible(false);
  };

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseAmount}>{item.amount}</Text>
        <Text style={styles.expenseDate}>{item.date}</Text>
      </View>
      <Text style={styles.expenseDescription}>{item.description}</Text>
      <View style={styles.expenseFooter}>
        <Text style={styles.expenseCategory}>{item.category}</Text>
        <Text style={styles.expenseGroup}>{item.groupName}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Expenses</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <View style={{ width: 24 }} />
            </View>


            <View style={styles.formContainer}>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Amount"
                  placeholderTextColor="#9ca3af"
                  value={newExpense.amount}
                  onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                  keyboardType="numeric"
                />
                <Text style={styles.currencySymbol}>$</Text>
              </View>


              <TextInput
                style={styles.textInput}
                placeholder="Description"
                placeholderTextColor="#9ca3af"
                value={newExpense.description}
                onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
              />


              <View style={styles.categoryContainer}>
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.categorySelector}>
                  <Text style={styles.selectedCategory}>{newExpense.category}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </View>
              </View>

    
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Date"
                  placeholderTextColor="#9ca3af"
                  value={newExpense.date}
                  onChangeText={(text) => setNewExpense({ ...newExpense, date: text })}
                />
                <Text style={styles.dateIcon}>📅</Text>
              </View>


              <View style={styles.splitSection}>
                <Text style={styles.sectionTitle}>Split with</Text>
                <View style={styles.groupInfo}>
                  <View style={styles.groupAvatar}>
                    <Text style={styles.avatarText}>G</Text>
                  </View>
                  <View style={styles.groupDetails}>
                    <Text style={styles.groupName}>{newExpense.groupName}</Text>
                    <Text style={styles.splitTypeText}>{newExpense.splitType}</Text>
                  </View>
                </View>

                <View style={styles.splitButtons}>
                  <TouchableOpacity
                    style={[
                      styles.splitButton,
                      newExpense.splitType === 'Split unequally' && styles.splitButtonActive
                    ]}
                    onPress={() => setNewExpense({ ...newExpense, splitType: 'Split unequally' })}
                  >
                    <Text style={[
                      styles.splitButtonText,
                      newExpense.splitType === 'Split unequally' && styles.splitButtonTextActive
                    ]}>
                      Split Unequally
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.splitButton,
                      newExpense.splitType === 'Split equally' && styles.splitButtonActive
                    ]}
                    onPress={() => setNewExpense({ ...newExpense, splitType: 'Split equally' })}
                  >
                    <Text style={[
                      styles.splitButtonText,
                      newExpense.splitType === 'Split equally' && styles.splitButtonTextActive
                    ]}>
                      Split Equally
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>


              <TouchableOpacity style={styles.saveButton} onPress={handleAddExpense}>
                <Text style={styles.saveButtonText}>Save Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    paddingTop: Platform.OS === 'ios' ? hp('2.5%') : hp('2%'),
    paddingBottom: hp('2%'),
    backgroundColor: '#ffffff',
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: '#e5e7eb',
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
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? wp('8.5%') : wp('7%'),
    fontWeight: Platform.OS === 'ios' ? '700' : '600',
    color: '#1f2937',
    letterSpacing: Platform.OS === 'ios' ? -0.5 : 0,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: wp('4%'),
    fontWeight: '500',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  expenseAmount: {
    fontSize: Platform.OS === 'ios' ? wp('5.5%') : wp('5%'),
    fontWeight: Platform.OS === 'ios' ? '700' : '600',
    color: '#1f2937',
  },
  expenseDate: {
    fontSize: Platform.OS === 'ios' ? wp('3.8%') : wp('3.5%'),
    color: '#6b7280',
  },
  expenseDescription: {
    fontSize: Platform.OS === 'ios' ? wp('4.3%') : wp('4%'),
    color: '#374151',
    marginBottom: hp('1%'),
    lineHeight: Platform.OS === 'ios' ? hp('2.8%') : hp('2.5%'),
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseCategory: {
    fontSize: Platform.OS === 'ios' ? wp('3.8%') : wp('3.5%'),
    color: '#6366f1',
    fontWeight: '500',
  },
  expenseGroup: {
    fontSize: Platform.OS === 'ios' ? wp('3.8%') : wp('3.5%'),
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: hp('90%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  closeButton: {
    padding: wp('2%'),
  },
  closeButtonText: {
    fontSize: wp('5%'),
    color: '#64748b',
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#000000',
  },
  formContainer: {
    padding: wp('5%'),
  },
  inputContainer: {
    position: 'relative',
    marginBottom: hp('2%'),
  },
  textInput: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: 8,
    fontSize: wp('4%'),
    color: '#000000',
  },
  currencySymbol: {
    position: 'absolute',
    right: wp('4%'),
    top: hp('1.5%'),
    fontSize: wp('4%'),
    color: '#64748b',
  },
  dateIcon: {
    position: 'absolute',
    right: wp('4%'),
    top: hp('1.2%'),
    fontSize: wp('4%'),
  },
  categoryContainer: {
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#000000',
    marginBottom: hp('1%'),
  },
  categorySelector: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCategory: {
    fontSize: wp('4%'),
    color: '#000000',
  },
  dropdownArrow: {
    fontSize: wp('3%'),
    color: '#64748b',
  },
  splitSection: {
    marginBottom: hp('3%'),
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  groupAvatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  avatarText: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#64748b',
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#000000',
  },
  splitTypeText: {
    fontSize: wp('3.5%'),
    color: '#64748b',
  },
  splitButtons: {
    flexDirection: 'row',
    gap: wp('3%'),
  },
  splitButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: hp('1.5%'),
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  splitButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  splitButtonText: {
    fontSize: wp('3.5%'),
    color: '#64748b',
    fontWeight: '500',
  },
  splitButtonTextActive: {
    color: '#3b82f6',
  },
  saveButton: {
    backgroundColor: '#93c5fd',
    paddingVertical: hp('2%'),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  saveButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#1e40af',
  },
});
