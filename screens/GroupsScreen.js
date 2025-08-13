import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, StatusBar, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { listenToUserGroups, deleteGroup } from '../services/groupService';
import { auth } from '../firebaseConfig';

export default function GroupsScreen({ user, navigation }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up real-time listener for groups
    const unsubscribe = listenToUserGroups((groupsData) => {
      setGroups(groupsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderGroupItem = (group) => {
    const balance = group.userBalance || 0;
    const isOwed = balance > 0;
    const owes = balance < 0;
    
    return (
      <TouchableOpacity
        key={group.id}
        style={styles.groupItem}
        onPress={() => navigation.navigate('GroupDetails', { group })}
      >
        <View style={styles.groupContent}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{group.name}</Text>
            {balance === 0 ? (
              <Text style={styles.groupBalanceSettled}>All settled up</Text>
            ) : (
              <Text style={[
                styles.groupBalance,
                owes ? styles.balanceOwe : styles.balanceOwed
              ]}>
                {owes ? 'You owe' : 'You are owed'} ${Math.abs(balance).toFixed(2)}
              </Text>
            )}
          </View>
          <View style={styles.groupImageContainer}>
            <Image 
              source={{ 
                uri: group.imageURL || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop'
              }} 
              style={styles.groupImage} 
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No groups yet</Text>
          <Text style={styles.emptySubtext}>Create your first group to get started!</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {groups.map(renderGroupItem)}
        </ScrollView>
      )}
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
  groupBalanceSettled: {
    color: '#6b7280',
    fontSize: wp('4%'),
    fontWeight: '500',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('10%'),
  },
  emptyText: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('1%'),
  },
  emptySubtext: {
    fontSize: wp('4%'),
    color: '#6b7280',
    textAlign: 'center',
  },
});