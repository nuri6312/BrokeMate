import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { createGroup } from '../services/groupService';

export default function NewGroupScreen({ navigation }) {
  const [groupName, setGroupName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInviteMember = () => {
    const email = memberEmail.trim().toLowerCase();
    
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Check if email is already added
    if (members.some(member => member.email === email)) {
      Alert.alert('Error', 'This email is already added to the group');
      return;
    }

    setMembers([...members, { id: Date.now().toString(), email }]);
    setMemberEmail('');
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      setLoading(true);
      
      const groupData = {
        name: groupName.trim(),
        description: '',
        imageURL: '',
        currency: 'USD'
      };

      const result = await createGroup(groupData);
      
      if (result.success) {
        let successMessage = 'Group created successfully!';
        let failedMembers = [];

        // If group created successfully and there are members to add
        if (members.length > 0) {
          const memberResults = await addMembersToNewGroup(result.id, members);
          failedMembers = memberResults.failed;
          
          if (memberResults.successful > 0) {
            successMessage = `Group created with ${memberResults.successful} member${memberResults.successful !== 1 ? 's' : ''} added!`;
          }
        }
        
        if (failedMembers.length > 0) {
          Alert.alert(
            'Group Created', 
            `${successMessage}\n\nCouldn't add: ${failedMembers.join(', ')}\n(They might not have accounts yet)`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert('Success', successMessage, [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const addMembersToNewGroup = async (groupId, membersList) => {
    const { addMemberToGroup } = await import('../services/groupService');
    let successful = 0;
    let failed = [];
    
    for (const member of membersList) {
      try {
        const result = await addMemberToGroup(groupId, member.email);
        if (result.success) {
          successful++;
        } else {
          failed.push(member.email);
          console.warn(`Failed to add member ${member.email}:`, result.error);
        }
      } catch (error) {
        failed.push(member.email);
        console.error(`Error adding member ${member.email}:`, error);
      }
    }
    
    return { successful, failed };
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
        <Text style={styles.title}>New Group</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.form}>
          <TextInput
            style={styles.groupNameInput}
            placeholder="Group name"
            placeholderTextColor="#9ca3af"
            value={groupName}
            onChangeText={setGroupName}
          />

          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Add members</Text>
            
            <View style={styles.inviteContainer}>
              <TextInput
                style={styles.memberInput}
                placeholder="Enter email address"
                placeholderTextColor="#9ca3af"
                value={memberEmail}
                onChangeText={setMemberEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleInviteMember}
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={styles.inviteButton}
                onPress={handleInviteMember}
              >
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>

            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <Text style={styles.memberEmail}>{member.email}</Text>
                <TouchableOpacity
                  onPress={() => setMembers(members.filter(m => m.id !== member.id))}
                >
                  <Ionicons name="close-circle" size={wp('5%')} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.createButton, (!groupName.trim() || loading) && styles.createButtonDisabled]}
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Group'}
          </Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
  },
  form: {
    paddingHorizontal: wp('6%'),
    paddingTop: hp('3%'),
  },
  groupNameInput: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    fontSize: wp('4.5%'),
    color: '#1f2937',
    marginBottom: hp('3%'),
  },
  membersSection: {
    marginBottom: hp('3%'),
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('2%'),
  },
  inviteContainer: {
    flexDirection: 'row',
    marginBottom: hp('2%'),
  },
  memberInput: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    fontSize: wp('4%'),
    color: '#1f2937',
    marginRight: wp('3%'),
  },
  inviteButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    justifyContent: 'center',
  },
  inviteButtonText: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#ffffff',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    marginBottom: hp('1%'),
  },
  memberEmail: {
    fontSize: wp('4%'),
    color: '#1f2937',
  },
  createButton: {
    backgroundColor: '#10b981',
    marginHorizontal: wp('6%'),
    marginBottom: hp('3%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('8%'),
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  createButtonText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#ffffff',
  },
});