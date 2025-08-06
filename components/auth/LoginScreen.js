import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// Note: Assuming these services and libraries are available in your project setup.
import { signIn } from '../../services/authService';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function LoginScreen({ onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // useSafeAreaInsets is a hook from 'react-native-safe-area-context'
  // that provides information about the safe area of the device.
  const insets = useSafeAreaInsets();

  // Function to handle the sign-in button press.
  const handleSignIn = async () => {
    // Basic form validation.
    if (!email || !password) {
      // We use Alert for a simple pop-up message.
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true); // Show a loading state on the button.
    // Call the external signIn service.
    const result = await signIn(email, password);
    setLoading(false); // Hide the loading state.

    // Check the result of the sign-in attempt.
    if (result.success) {
      // Clear the input fields on successful sign-in.
      setEmail('');
      setPassword('');
      // In a real app, you would navigate to the home screen here.
    } else {
      // Display an error message if sign-in fails.
      Alert.alert('Error', result.error);
    }
  };

  return (
    // SafeAreaView ensures content is not obscured by device notches, etc.
    <SafeAreaView style={styles.container}>
      {/* StatusBar component to control the status bar's appearance. */}
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Main content container with dynamic padding for the top safe area. */}
      <View style={[styles.content, { paddingTop: insets.top + hp('2%') }]}>
        {/* App Icon Section */}
        <View style={styles.iconContainer}>
          <View style={styles.icon}>
            {/* Professional wallet/finance icon */}
            <MaterialIcons name="account-balance-wallet" size={wp('9%')} color="#ffffff" />
          </View>
        </View>

        {/* Welcome Text */}
        <Text style={styles.welcomeTitle}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your BrokeMate account</Text>

        {/* Email Input Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address </Text>
          <View style={styles.inputWrapper}>
            {/* Professional email icon */}
            <Ionicons name="mail-outline" size={wp('5%')} color="#9ca3af" style={styles.inputIconStyle} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email "
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Input Field */}
        <View style={styles.inputContainer}>
          <View style={styles.passwordHeader}>
            <Text style={styles.inputLabel}>Password</Text>
            {/* "Forgot Password" link as a TouchableOpacity. */}
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            {/* Professional lock icon */}
            <Ionicons name="lock-closed-outline" size={wp('5%')} color="#9ca3af" style={styles.inputIconStyle} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {/* Professional eye icon for show/hide password */}
            <TouchableOpacity style={styles.eyeIcon}>
              <Ionicons name="eye-outline" size={wp('4.5%')} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.signInButton, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onSwitchToSignUp}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('5%'),
  },
  iconContainer: {
    marginBottom: hp('4%'),
  },
  icon: {
    width: wp('20%'),
    height: wp('20%'),
    backgroundColor: '#10b981',
    borderRadius: wp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  welcomeTitle: {
    fontSize: wp('8.5%'),
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: hp('1%'),
    textAlign: 'center',
    letterSpacing: -0.5,
    // Note: Assuming 'PlusJakartaSans_700Bold' is a font you have loaded.
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  subtitle: {
    fontSize: wp('4.3%'),
    color: '#6b7280',
    marginBottom: hp('5%'),
    textAlign: 'center',
    lineHeight: hp('2.8%'),
    // Note: Assuming 'PlusJakartaSans_400Regular' is a font you have loaded.
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  inputContainer: {
    width: '100%',
    marginBottom: hp('2.5%'),
  },
  inputLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#374151',
    marginBottom: hp('1%'),
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  forgotPassword: {
    fontSize: wp('3.5%'),
    color: '#10b981',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: wp('4%'),
    height: hp('6.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIconStyle: {
    marginRight: wp('3%'),
  },
  input: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#1f2937',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: wp('1%'),
  },

  signInButton: {
    width: '100%',
    height: hp('6.5%'),
    backgroundColor: '#10b981',
    borderRadius: wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1%'),
    marginBottom: hp('4%'),
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: wp('4.5%'),
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: wp('4%'),
    color: '#6b7280',
  },
  signUpLink: {
    fontSize: wp('4%'),
    color: '#10b981',
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
