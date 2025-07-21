import React from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Alert, Platform } from 'react-native';
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
    <View style={styles.container}>
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
  title: {
    fontSize: Platform.OS === 'ios' ? wp('8.5%') : wp('7%'),
    fontWeight: Platform.OS === 'ios' ? '700' : '600',
    color: '#1f2937',
    marginBottom: hp('0.5%'),
    letterSpacing: Platform.OS === 'ios' ? -0.5 : 0,
  },
  subtitle: {
    fontSize: Platform.OS === 'ios' ? wp('4.3%') : wp('4%'),
    color: '#6b7280',
    lineHeight: Platform.OS === 'ios' ? hp('2.8%') : hp('2.5%'),
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
    fontSize: Platform.OS === 'ios' ? wp('7%') : wp('6%'),
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    color: '#1f2937',
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  userEmail: {
    fontSize: Platform.OS === 'ios' ? wp('4.3%') : wp('4%'),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? hp('2.8%') : hp('2.5%'),
  },
  logoutButton: {
    width: '100%',
    height: Platform.OS === 'ios' ? hp('6.3%') : hp('7%'),
    backgroundColor: '#ef4444',
    borderRadius: Platform.OS === 'ios' ? wp('2.5%') : wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: Platform.OS === 'ios' ? wp('4.3%') : wp('4.5%'),
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
  },
});