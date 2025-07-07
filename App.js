import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { onAuthStateChange } from './services/authService';
import LoginScreen from './components/auth/LoginScreen';
import SignUpScreen from './components/auth/SignUpScreen';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // If user is authenticated, show home screen
  if (user) {
    return (
      <View style={styles.container}>
        <HomeScreen user={user} />
        <StatusBar style="auto" />
      </View>
    );
  }

  // If user is not authenticated, show auth screens
  return (
    <View style={styles.container}>
      {currentScreen === 'login' ? (
        <LoginScreen onSwitchToSignUp={() => setCurrentScreen('signup')} />
      ) : (
        <SignUpScreen onSwitchToLogin={() => setCurrentScreen('login')} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});