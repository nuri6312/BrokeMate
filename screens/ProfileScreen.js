import React from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logOut } from '../services/authService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ProfileScreen({ user }) {
  const handleLogout = async () => {
    const result = await logOut();
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account settings</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('6%'),
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: hp('5%'),
  },
  userName: {
    fontSize: wp('7%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  userEmail: {
    fontSize: wp('4.3%'),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: hp('2.8%'),
  },
  logoutButton: {
    width: '100%',
    height: hp('6.5%'),
    backgroundColor: '#ef4444',
    borderRadius: wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
});