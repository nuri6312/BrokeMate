import React from 'react';
import { StyleSheet, Text, View, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen({ user }) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={wp('6%')} color="#6b7280" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <View style={styles.budgetCard}>
            <View style={styles.budgetIcon}>
              <MaterialIcons name="account-balance-wallet" size={wp('6%')} color="#6b7280" />
            </View>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetLabel}>Budget remaining for July</Text>
              <Text style={styles.budgetAmount}>$500</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Payments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Payments</Text>
          
          <View style={styles.paymentItem}>
            <View style={styles.paymentIcon}>
              <Ionicons name="home-outline" size={wp('5%')} color="#6b7280" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Rent</Text>
              <Text style={styles.paymentAmount}>$25</Text>
            </View>
            <Text style={styles.paymentDue}>Due in 3 days</Text>
          </View>

          <View style={styles.paymentItem}>
            <View style={styles.paymentIcon}>
              <Ionicons name="flash-outline" size={wp('5%')} color="#6b7280" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Utilities</Text>
              <Text style={styles.paymentAmount}>$15</Text>
            </View>
            <Text style={styles.paymentDue}>Due in 7 days</Text>
          </View>
        </View>

        {/* Group Balances Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Balances</Text>
          
          <View style={styles.groupItem}>
            <View style={styles.groupIcon}>
              <Ionicons name="people-outline" size={wp('5%')} color="#6b7280" />
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupTitle}>Trip to the beach</Text>
              <Text style={styles.groupAmount}>$10</Text>
            </View>
            <Text style={styles.groupStatus}>You owe</Text>
          </View>

          <View style={styles.groupItem}>
            <View style={styles.groupIcon}>
              <Ionicons name="people-outline" size={wp('5%')} color="#6b7280" />
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupTitle}>Dinner with friends</Text>
              <Text style={styles.groupAmount}>$20</Text>
            </View>
            <Text style={styles.groupStatusOwed}>You're owed</Text>
          </View>
        </View>

        {/* Add some bottom padding for the floating button */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Add Expense Button */}
      <TouchableOpacity style={styles.floatingButton}>
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
  title: {
    fontSize: wp('8.5%'),
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  settingsButton: {
    padding: wp('2%'),
  },

  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
  },
  section: {
    marginBottom: hp('3%'),
  },
  sectionTitle: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('2%'),
  },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetIcon: {
    width: wp('12%'),
    height: wp('12%'),
    backgroundColor: '#f3f4f6',
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  budgetIconText: {
    fontSize: wp('6%'),
    color: '#6b7280',
  },
  budgetInfo: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: wp('4%'),
    color: '#6b7280',
    marginBottom: hp('0.5%'),
  },
  budgetAmount: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#10b981',
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentIcon: {
    width: wp('10%'),
    height: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  paymentIconText: {
    fontSize: wp('5%'),
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: wp('4.2%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  paymentAmount: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
  },
  paymentDue: {
    fontSize: wp('3.5%'),
    color: '#9ca3af',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  groupIcon: {
    width: wp('10%'),
    height: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  groupIconText: {
    fontSize: wp('5%'),
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: wp('4.2%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  groupAmount: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
  },
  groupStatus: {
    fontSize: wp('3.5%'),
    color: '#ef4444',
    fontWeight: '500',
  },
  groupStatusOwed: {
    fontSize: wp('3.5%'),
    color: '#10b981',
    fontWeight: '500',
  },
  bottomPadding: {
    height: hp('10%'),
  },
  floatingButton: {
    position: 'absolute',
    bottom: hp('2%'),
    right: wp('2%'),
    backgroundColor: '#3b82f6',
    borderRadius: wp('8%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
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