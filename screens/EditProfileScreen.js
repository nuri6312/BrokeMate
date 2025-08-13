import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUserProfile, updateUserProfileData } from '../services/profileService';

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    loadCurrentProfile();
  }, []);

  const loadCurrentProfile = async () => {
    try {
      setLoading(true);
      const result = await getCurrentUserProfile();
      
      if (result.success) {
        setProfileData({
          displayName: result.data.displayName || '',
          phoneNumber: result.data.phoneNumber || '',
          email: result.data.email || '',
        });
      } else {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    try {
      setSaving(true);
      const result = await updateUserProfileData({
        displayName: profileData.displayName.trim(),
        phoneNumber: profileData.phoneNumber.trim(),
      });

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Display Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Display Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your display name"
              placeholderTextColor="#9ca3af"
              value={profileData.displayName}
              onChangeText={(value) => handleInputChange('displayName', value)}
              autoCapitalize="words"
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your phone number"
              placeholderTextColor="#9ca3af"
              value={profileData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Email (Read-only) */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={[styles.textInput, styles.readOnlyInput]}
              value={profileData.email}
              editable={false}
            />
            <Text style={styles.helperText}>
              Email cannot be changed from here. Contact support if needed.
            </Text>
          </View>

          {/* Additional Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              * Required fields
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  form: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('3%'),
  },
  inputContainer: {
    marginBottom: hp('3%'),
  },
  inputLabel: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('1%'),
  },
  textInput: {
    backgroundColor: '#ffffff',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    fontSize: wp('4%'),
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  readOnlyInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  helperText: {
    fontSize: wp('3.5%'),
    color: '#6b7280',
    marginTop: hp('0.5%'),
    fontStyle: 'italic',
  },
  infoContainer: {
    marginTop: hp('2%'),
    paddingVertical: hp('2%'),
  },
  infoText: {
    fontSize: wp('3.5%'),
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#6b7280',
  },
});