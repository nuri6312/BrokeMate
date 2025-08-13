import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { searchUsersByEmail, addMemberToGroup } from '../services/groupService';

export default function AddMembersScreen({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const groupId = route.params?.groupId;

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    // Only search when user types a complete email (contains @)
    if (query.includes('@') && query.length >= 5) {
      setLoading(true);
      const result = await searchUsersByEmail(query);
      
      if (result.success) {
        setSearchResults(result.data);
      } else {
        console.error('Error searching users:', result.error);
        setSearchResults([]);
      }
      setLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  const toggleMemberSelection = (member) => {
    const isSelected = selectedMembers.find(m => m.id === member.id);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) return;
    
    try {
      setLoading(true);
      
      if (!groupId) {
        Alert.alert('Error', 'Group ID not found');
        return;
      }

      // Add each selected member
      for (const member of selectedMembers) {
        const result = await addMemberToGroup(groupId, member.email);
        if (!result.success) {
          Alert.alert('Error', `Failed to add ${member.name}: ${result.error}`);
          return;
        }
      }

      Alert.alert('Success', 'Members added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding members:', error);
      Alert.alert('Error', 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={wp('6%')} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Members</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={wp('5%')} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter exact email address"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <ScrollView style={styles.membersContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <Text style={styles.loadingText}>Searching...</Text>
          ) : searchResults.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Search Results</Text>
              {searchResults.map((user) => {
                const isSelected = selectedMembers.find(m => m.id === user.id);
                return (
                  <TouchableOpacity
                    key={user.id}
                    style={[styles.memberItem, isSelected && styles.memberItemSelected]}
                    onPress={() => toggleMemberSelection(user)}
                  >
                    <View style={styles.memberAvatar}>
                      <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{user.name}</Text>
                      <Text style={styles.memberUsername}>{user.email}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={wp('6%')} color="#10b981" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          ) : searchQuery.includes('@') && searchQuery.length >= 5 ? (
            <Text style={styles.noResultsText}>No user found with this email address</Text>
          ) : (
            <Text style={styles.searchHintText}>Enter the complete email address of the person you want to add</Text>
          )}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.addButton, (selectedMembers.length === 0 || loading) && styles.addButtonDisabled]}
          onPress={handleAddMembers}
          disabled={selectedMembers.length === 0 || loading}
        >
          <Text style={styles.addButtonText}>
            {loading ? 'Adding...' : `Add ${selectedMembers.length} Member${selectedMembers.length !== 1 ? 's' : ''}`}
          </Text>
        </TouchableOpacity>
      </View>
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
  closeButton: {
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
    paddingHorizontal: wp('6%'),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    marginVertical: hp('2%'),
  },
  searchIcon: {
    marginRight: wp('3%'),
  },
  searchInput: {
    flex: 1,
    paddingVertical: hp('2%'),
    fontSize: wp('4%'),
    color: '#1f2937',
  },
  membersContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('2%'),
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberItemSelected: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  memberAvatar: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    marginRight: wp('4%'),
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('0.3%'),
  },
  memberUsername: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: hp('2%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
    marginVertical: hp('2%'),
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: hp('2%'),
  },
  noResultsText: {
    fontSize: wp('4%'),
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: hp('2%'),
  },
  searchHintText: {
    fontSize: wp('4%'),
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: hp('4%'),
    lineHeight: wp('6%'),
  },
  avatarText: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#6b7280',
  },
});