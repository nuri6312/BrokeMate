import React from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logOut } from '../services/authService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ user, navigation }) {
  const handleLogout = async () => {
    const result = await logOut();
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const profileData = {
    name: 'Sophia Clark',
    username: '@sophia.clark',
    email: 'sophia.clark@email.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200&h=200&fit=crop&crop=face',
  };

  const menuItems = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: 'shield-outline',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: 'help',
      title: 'Help',
      icon: 'help-circle-outline',
      onPress: () => {},
    },
  ];

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
        <Text style={styles.title}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
          </View>
          <Text style={styles.userName}>{profileData.name}</Text>
          <Text style={styles.userHandle}>{profileData.username}</Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.accountItem}>
            <View style={styles.accountIcon}>
              <Ionicons name="mail-outline" size={wp('5%')} color="#6b7280" />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>{profileData.email}</Text>
            </View>
          </View>

          <View style={styles.accountItem}>
            <View style={styles.accountIcon}>
              <Ionicons name="call-outline" size={wp('5%')} color="#6b7280" />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Phone</Text>
              <Text style={styles.accountValue}>{profileData.phone}</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={wp('5%')} color="#6b7280" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={wp('4%')} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
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
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: hp('4%'),
    backgroundColor: '#ffffff',
    marginBottom: hp('2%'),
  },
  avatarContainer: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('12.5%'),
    overflow: 'hidden',
    marginBottom: hp('2%'),
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userName: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('0.5%'),
  },
  userHandle: {
    fontSize: wp('4%'),
    color: '#6b7280',
    marginBottom: hp('2%'),
  },
  editButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: wp('8%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('6%'),
  },
  editButtonText: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#1f2937',
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: hp('2%'),
    paddingVertical: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: wp('6%'),
    marginBottom: hp('2%'),
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
  },
  accountIcon: {
    width: wp('10%'),
    height: wp('10%'),
    backgroundColor: '#f3f4f6',
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  accountValue: {
    fontSize: wp('4%'),
    color: '#6b7280',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
  },
  menuIcon: {
    width: wp('10%'),
    height: wp('10%'),
    backgroundColor: '#f3f4f6',
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('4%'),
  },
  menuTitle: {
    flex: 1,
    fontSize: wp('4.5%'),
    color: '#1f2937',
  },
  logoutContainer: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('3%'),
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
});