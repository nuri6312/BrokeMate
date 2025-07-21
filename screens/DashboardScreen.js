import React from 'react';
import { StyleSheet, Text, View, StatusBar, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function DashboardScreen({ user }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.displayName || user?.email}!</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.placeholderText}>Dashboard content will go here</Text>
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
  placeholderText: {
    fontSize: Platform.OS === 'ios' ? wp('4.3%') : wp('4%'),
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? hp('2.8%') : hp('2.5%'),
  },
});