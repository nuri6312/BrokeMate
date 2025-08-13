import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { updateGroup, deleteGroup, removeMemberFromGroup } from '../services/groupService';
import { auth } from '../firebaseConfig';

export default function GroupSettingsScreen({ navigation, route }) {
  const { group } = route.params || {};
  const [groupName, setGroupName] = useState(group?.name || '');
  const [groupDescription, setGroupDescription] = useState(group?.description || '');
  const [loading, setLoading] = useState(false);
  const currentUserId = auth.currentUser?.uid;
  const isCreator = group?.createdBy === currentUserId;

  const handleUpdateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    try {
      setLoading(true);
      const result = await updateGroup(group.id, {
        name: groupName.trim(),
        description: groupDescription.trim(),
      });

      if (result.success) {
        Alert.alert('Success', 'Group updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error updating group:', error);
      Alert.alert('Error', 'Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await deleteGroup(group.id);
              
              if (result.success) {
                Alert.alert('Success', 'Group deleted successfully', [
                  { text: 'OK', onPress: () => {
                    // Navigate back to Groups screen by popping all the way back
                    navigation.popToTop();
                  }}
                ]);
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'Failed to delete group');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRemoveMember = (memberId, memberName) => {
    if (memberId === group.createdBy) {
      Alert.alert('Error', 'Cannot remove group creator');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await removeMemberFromGroup(group.id, memberId);
              
              if (result.success) {
                Alert.alert('Success', 'Member removed successfully');
                // Refresh the group data
                navigation.goBack();
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={wp('6%')} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Group Settings</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleUpdateGroup}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Group Name</Text>
            <TextInput
              style={styles.textInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Enter group name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={groupDescription}
              onChangeText={setGroupDescription}
              placeholder="Enter group description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Members Management Section */}
        {isCreator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manage Members</Text>
            
            {Object.entries(group?.memberDetails || {}).map(([memberId, memberInfo]) => (
              <View key={memberId} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{memberInfo.name}</Text>
                  <Text style={styles.memberEmail}>{memberInfo.email}</Text>
                  {memberId === group.createdBy && (
                    <Text style={styles.creatorBadge}>Creator</Text>
                  )}
                </View>
                {memberId !== group.createdBy && (
                  <TouchableOpacity
                    style={styles.removeMemberButton}
                    onPress={() => handleRemoveMember(memberId, memberInfo.name)}
                  >
                    <Ionicons name="person-remove" size={wp('5%')} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Danger Zone */}
        {isCreator && (
          <View style={styles.section}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteGroup}
              disabled={loading}
            >
              <Ionicons name="trash-outline" size={wp('5%')} color="#ffffff" />
              <Text style={styles.deleteButtonText}>Delete Group</Text>
            </TouchableOpacity>
          </View>
        )}
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
  backButton: {
    padding: wp('2%'),
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginVertical: hp('1%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: hp('2%'),
  },
  dangerTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: hp('2%'),
  },
  inputContainer: {
    marginBottom: hp('2%'),
  },
  inputLabel: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: hp('1%'),
  },
  textInput: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    fontSize: wp('4%'),
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: hp('10%'),
    textAlignVertical: 'top',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: wp('4.5%'),
    fontWeight: '500',
    color: '#1f2937',
  },
  memberEmail: {
    fontSize: wp('3.8%'),
    color: '#6b7280',
    marginTop: hp('0.3%'),
  },
  creatorBadge: {
    fontSize: wp('3.5%'),
    color: '#10b981',
    fontWeight: '500',
    marginTop: hp('0.3%'),
  },
  removeMemberButton: {
    padding: wp('2%'),
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
    gap: wp('2%'),
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
});