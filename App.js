import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { onAuthStateChange } from './services/authService';
import LoginScreen from './components/auth/LoginScreen';
import SignUpScreen from './components/auth/SignUpScreen';
import MainTabNavigator from './navigation/MainTabNavigator';

// ✅ Import Google Font loader and font styles
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import AppLoading from 'expo-app-loading';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');

  // ✅ Load the fonts before showing the app
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Wait for fonts before rendering anything
  if (!fontsLoaded) {
    return <AppLoading />;
  }

  // ✅ Show main app if user is signed in
  if (user) {
    return (
      <SafeAreaProvider>
        <MainTabNavigator user={user} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  // ✅ Show login or signup screen
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {currentScreen === 'login' ? (
          <LoginScreen onSwitchToSignUp={() => setCurrentScreen('signup')} />
        ) : (
          <SignUpScreen onSwitchToLogin={() => setCurrentScreen('login')} />
        )}
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
