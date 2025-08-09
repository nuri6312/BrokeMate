import React, { useState } from 'react';
import { StyleSheet, Text, View, StatusBar, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';

export default function GroupsScreen({ user, navigation }) {
  const [groups] = useState([
    {
      id: '1',
      name: 'Dorm 2024',
      balance: 25,
      status: 'owe',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
    },
    {
      id: '2',
      name: 'Trip to Tahoe',
      balance: 150,
      status: 'owed',
      image: 'https://images.unsplash.com/photo-1544737151-6e4b9d1b5d4a?w=400&h=300&fit=crop',
    },
    {
      id: '3',
      name: 'Roommates',
      balance: 30,
      status: 'owe',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    },
    {
      id: '4',
      name: 'Ski Trip',
      balance: 75,
      status: 'owed',
      image: 'https://images.unsplash.com/photo-1551524164-6cf2ac531400?w=400&h=300&fit=crop',
    },
  ]);

  const renderGroupItem = (group) => (
    <TouchableOpacity
      key={group.id}
      style={styles.groupItem}
      onPress={() => navigation.navigate('GroupDetails', { group })}
    >
      <View style={styles.groupContent}>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={[
            styles.groupBalance,
            group.status === 'owe' ? styles.balanceOwe : styles.balanceOwed
          ]}>
            {group.status === 'owe' ? 'You owe' : 'You are owed'} ${group.balance}
          </Text>
        </View>
        <View style={styles.groupImageContainer}>
          <Image source={{ uri: group.image }} style={styles.groupImage} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('NewGroup')}
        >
          <Ionicons name="add" size={wp('6%')} color="#1f2937" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {groups.map(renderGroupItem)}
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
  title: {
    fontSize: wp('8.5%'),
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  addButton: {
    padding: wp('2%'),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
  },
  groupItem: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupContent: {
    flexDirection: 'row',
    padding: wp('4%'),
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('0.5%'),
  },
  groupBalance: {
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  balanceOwe: {
    color: '#ef4444',
  },
  balanceOwed: {
    color: '#10b981',
  },
  groupImageContainer: {
    width: wp('20%'),
    height: wp('15%'),
    borderRadius: wp('2%'),
    overflow: 'hidden',
  },
  groupImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});