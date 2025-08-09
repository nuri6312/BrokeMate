import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen({ navigation }) {
  const [notifications] = useState([
    {
      id: '1',
      type: 'payment_reminder',
      title: 'Payment Reminder',
      time: '10:30 AM',
      icon: 'notifications-outline',
      section: 'today',
    },
    {
      id: '2',
      type: 'group_activity',
      title: 'Group Activity Update',
      time: '9:15 AM',
      icon: 'people-outline',
      section: 'today',
    },
    {
      id: '3',
      type: 'expense_shared',
      title: 'Expense Shared',
      time: '6:45 PM',
      icon: 'receipt-outline',
      section: 'yesterday',
    },
    {
      id: '4',
      type: 'payment_received',
      title: 'Payment Received',
      time: '2:20 PM',
      icon: 'cash-outline',
      section: 'yesterday',
    },
    {
      id: '5',
      type: 'group_activity',
      title: 'Group Activity Update',
      time: '11:00 AM',
      icon: 'people-outline',
      section: 'yesterday',
    },
  ]);

  const getNotificationsBySection = (section) => {
    return notifications.filter(notification => notification.section === section);
  };

  const renderNotificationItem = (notification) => (
    <TouchableOpacity key={notification.id} style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <Ionicons name={notification.icon} size={wp('5%')} color="#6b7280" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
      <Ionicons name="chevron-forward" size={wp('4%')} color="#9ca3af" />
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          {getNotificationsBySection('today').map(renderNotificationItem)}
        </View>

        {/* Yesterday Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yesterday</Text>
          {getNotificationsBySection('yesterday').map(renderNotificationItem)}
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
  placeholder: {
    width: wp('10%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
  },
  section: {
    marginTop: hp('3%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('2%'),
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationIcon: {
    width: wp('10%'),
    height: wp('10%'),
    backgroundColor: '#f3f4f6',
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  notificationTime: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
  },
});