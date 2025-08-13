import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { 
  updateNotificationPreferences, 
  updateUserPreferences,
  getCurrentUserProfile 
} from '../services/profileService';

export default function SettingsScreen({ navigation }) {
  const [pushNotifications, setPushNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const result = await getCurrentUserProfile();
      if (result.success && result.data.preferences) {
        setPushNotifications(result.data.preferences.notifications?.pushEnabled || false);
        setCurrency(result.data.preferences.currency || 'USD');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (value) => {
    setPushNotifications(value);
    
    const result = await updateNotificationPreferences({
      pushEnabled: value
    });
    
    if (!result.success) {
      // Revert on error
      setPushNotifications(!value);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency);
    
    const result = await updateUserPreferences({
      currency: newCurrency
    });
    
    if (!result.success) {
      // Revert on error
      setCurrency(currency);
      Alert.alert('Error', 'Failed to update currency setting');
    }
  };

  const settingsItems = [
    {
      id: 'about',
      title: 'About BrokeMate',
      icon: 'information-circle-outline',
      onPress: () => {},
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'document-text-outline',
      onPress: () => {},
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-outline',
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
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        ) : (
          <>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive push notifications for reminders, updates, and important alerts.
              </Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#e5e7eb', true: '#10b981' }}
              thumbColor={pushNotifications ? '#ffffff' : '#ffffff'}
              disabled={loading}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => {
              Alert.alert(
                'Select Currency',
                'Choose your preferred currency',
                [
                  { text: 'USD', onPress: () => handleCurrencyChange('USD') },
                  { text: 'EUR', onPress: () => handleCurrencyChange('EUR') },
                  { text: 'GBP', onPress: () => handleCurrencyChange('GBP') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Currency</Text>
              <Text style={styles.settingDescription}>
                Select your preferred currency for all transactions and reports.
              </Text>
            </View>
            <View style={styles.currencyValue}>
              <Text style={styles.currencyText}>{currency}</Text>
              <Ionicons name="chevron-forward" size={wp('4%')} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={wp('4%')} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
          </>
        )}
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
  },
  settingInfo: {
    flex: 1,
    marginRight: wp('4%'),
  },
  settingTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('0.5%'),
  },
  settingDescription: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
    lineHeight: hp('2.2%'),
  },
  currencyValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: wp('4%'),
    color: '#1f2937',
    marginRight: wp('2%'),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
  },
  menuTitle: {
    fontSize: wp('4.5%'),
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#6b7280',
  },
});