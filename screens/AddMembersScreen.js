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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';

export default function AddMembersScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const suggestedMembers = [
    {
      id: '1',
      name: 'Jennifer Smith',
      username: '@jennifer.smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: '2',
      name: 'Alex Williams',
      username: '@alex.williams',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: '3',
      name: 'Emily Davis',
      username: '@emily.davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: '4',
      name: 'Ryan Clark',
      username: '@ryan.clark',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
  ];

  const toggleMemberSelection = (member) => {
    const isSelected = selectedMembers.find(m => m.id === member.id);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleAddMembers = () => {
    // Handle adding members logic here
    navigation.goBack();
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
            placeholder="Search by email or username"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.membersContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Suggested</Text>
          
          {suggestedMembers.map((member) => {
            const isSelected = selectedMembers.find(m => m.id === member.id);
            return (
              <TouchableOpacity
                key={member.id}
                style={[styles.memberItem, isSelected && styles.memberItemSelected]}
                onPress={() => toggleMemberSelection(member)}
              >
                <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberUsername}>{member.username}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={wp('6%')} color="#10b981" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.addButton, selectedMembers.length === 0 && styles.addButtonDisabled]}
          onPress={handleAddMembers}
          disabled={selectedMembers.length === 0}
        >
          <Text style={styles.addButtonText}>Add Members</Text>
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
});