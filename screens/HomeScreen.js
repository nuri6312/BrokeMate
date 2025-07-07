import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { logOut } from '../services/authService';

export default function HomeScreen({ user }) {
  const handleLogout = async () => {
    const result = await logOut();
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BrokeMate!</Text>
      <Text style={styles.subtitle}>Hello, {user.displayName || user.email}!</Text>
      <Text style={styles.info}>Firebase is successfully connected!</Text>
      
      {/* Add your main app features here */}
      <View style={styles.featuresContainer}>
        <TouchableOpacity style={styles.featureButton}>
          <Text style={styles.featureButtonText}>Add Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.featureButton}>
          <Text style={styles.featureButtonText}>View Groups</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.featureButton}>
          <Text style={styles.featureButtonText}>Split Bills</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 30,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featureButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  featureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});