import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, StatusBar, Platform } from 'react-native';
import { signIn } from '../../services/authService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function LoginScreen({ onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      setEmail('');
      setPassword('');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* App Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>$</Text>
        </View>
      </View>
      
      {/* Welcome Text */}
      <Text style={styles.welcomeTitle}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your BrokeMate account</Text>
      
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address or Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>✉</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email or phone"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>
      
      {/* Password Input */}
      <View style={styles.inputContainer}>
        <View style={styles.passwordHeader}>
          <Text style={styles.inputLabel}>Password</Text>
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.eyeIcon}>
            <Text style={styles.eyeIconText}>👁</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: Platform.OS === 'ios' ? hp('7.5%') : hp('5%'),
    paddingTop: Platform.OS === 'ios' ? hp('10%') : StatusBar.currentHeight + hp('5%'),
  },
  iconContainer: {
    marginBottom: 32,
  },
  icon: {
    width: 80,
    height: 80,
    backgroundColor: '#10b981',
    borderRadius: 20,
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
  iconText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  welcomeTitle: {
    fontSize: Platform.OS === 'ios' ? wp('8.5%') : wp('8%'),
    fontWeight: Platform.OS === 'ios' ? '700' : '600',
    color: '#1f2937',
    marginBottom: hp('1%'),
    textAlign: 'center',
    letterSpacing: Platform.OS === 'ios' ? -0.5 : 0,
  },
  subtitle: {
    fontSize: Platform.OS === 'ios' ? wp('4.3%') : wp('4%'),
    color: '#6b7280',
    marginBottom: hp('5%'),
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? hp('2.8%') : hp('2.5%'),
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: Platform.OS === 'ios' ? wp('2.5%') : wp('3%'),
    borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: wp('4%'),
    height: Platform.OS === 'ios' ? hp('6.3%') : hp('7%'),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#9ca3af',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  eyeIconText: {
    fontSize: 18,
    color: '#9ca3af',
  },
  signInButton: {
    width: '100%',
    height: Platform.OS === 'ios' ? hp('6.3%') : hp('7%'),
    backgroundColor: '#10b981',
    borderRadius: Platform.OS === 'ios' ? wp('2.5%') : wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1%'),
    marginBottom: hp('4%'),
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: '#6b7280',
  },
  signUpLink: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
});