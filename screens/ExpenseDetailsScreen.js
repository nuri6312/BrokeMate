import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function ExpenseDetailsScreen({ navigation, route }) {
  // Mock data - in real app this would come from route params or API
  const expenseData = {
    amount: 85.00,
    category: 'Food',
    date: 'July 15, 2024',
    note: 'Dinner with friends',
    group: 'Trip to the Coast',
    participants: [
      {
        id: 1,
        name: 'Liam',
        avatar: 'https://via.placeholder.com/40x40/10b981/ffffff?text=L',
        paid: 85.00,
        owes: 0,
      },
      {
        id: 2,
        name: 'Sophia',
        avatar: 'https://via.placeholder.com/40x40/3b82f6/ffffff?text=S',
        paid: 0,
        owes: 21.25,
      },
      {
        id: 3,
        name: 'Ethan',
        avatar: 'https://via.placeholder.com/40x40/f59e0b/ffffff?text=E',
        paid: 0,
        owes: 21.25,
      },
      {
        id: 4,
        name: 'Olivia',
        avatar: 'https://via.placeholder.com/40x40/ec4899/ffffff?text=O',
        paid: 0,
        owes: 21.25,
      },
    ]
  };

  const handleEdit = () => {
    // Navigate to AddExpenseScreen with existing data for editing
    navigation.navigate('AddExpense', {
      isEditing: true,
      expenseData: {
        amount: expenseData.amount.toString(),
        description: expenseData.note,
        category: {
          id: 'food',
          name: 'Food & Dining',
          icon: 'restaurant-outline',
          color: '#f59e0b'
        },
        date: new Date(expenseData.date),
        splitType: 'equally',
        participants: expenseData.participants
      }
    });
  };

  const handleSettleUp = () => {
    // TODO: Navigate to settle up screen
    console.log('Settle up');
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
        <View style={styles.headerSpacer} />
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
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>{formatCurrency(expenseData.amount)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{expenseData.category}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{expenseData.date}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Note</Text>
              <Text style={styles.detailValue}>{expenseData.note}</Text>
            </View>
          </View>
        </View>

        {/* Group Section */}
        <View style={styles.section}>
          <Text style={styles.groupTitle}>Group: {expenseData.group}</Text>
          
          <View style={styles.participantsList}>
            {expenseData.participants.map((participant) => (
              <View key={participant.id} style={styles.participantItem}>
                <View style={styles.participantLeft}>
                  <Image 
                    source={{ uri: participant.avatar }}
                    style={styles.participantAvatar}
                  />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{participant.name}</Text>
                    {participant.paid > 0 ? (
                      <Text style={styles.participantPaid}>
                        Paid {formatCurrency(participant.paid)}
                      </Text>
                    ) : (
                      <Text style={styles.participantOwes}>
                        Owes {formatCurrency(participant.owes)}
                      </Text>
                    )}
                  </View>
                </View>
                
                {participant.paid > 0 && (
                  <Text style={styles.participantAmount}>
                    Paid {formatCurrency(participant.paid)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settleButton} onPress={handleSettleUp}>
            <Text style={styles.settleButtonText}>Settle Up</Text>
          </TouchableOpacity>
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
  participantAmount: {
    fontSize: wp('4%'),
    color: '#1f2937',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: wp('4%'),
    marginTop: hp('2%'),
  },
  editButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: wp('6%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#374151',
  },
  settleButton: {
    flex: 1,
    backgroundColor: '#bfdbfe',
    borderRadius: wp('6%'),
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  settleButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#3b82f6',
  },
});