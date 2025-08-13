// Group Management Service with Expense Integration
import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { validateGroup, createTimestamp } from '../models/dataModels';
import { getUserProfile } from './databaseService';

// Create a new group
export const createGroup = async (groupData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get current user profile for member details
    const userProfile = await getUserProfile(currentUser.uid);
    if (!userProfile.success) {
      return { success: false, error: 'Could not get user profile' };
    }

    const group = {
      ...groupData,
      createdBy: currentUser.uid,
      members: [currentUser.uid],
      memberDetails: {
        [currentUser.uid]: {
          name: userProfile.data.displayName || 'User',
          email: userProfile.data.email,
          photoURL: userProfile.data.photoURL || ''
        }
      },
      totalExpenses: 0,
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    };

    const validation = validateGroup(group);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const docRef = await addDoc(collection(db, 'groups'), group);
    return { success: true, id: docRef.id, data: { id: docRef.id, ...group } };
  } catch (error) {
    console.error('Error creating group:', error);
    return { success: false, error: error.message };
  }
};

// Get user's groups with balance calculations (simplified query)
export const getUserGroups = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Simplified query - only filter by members
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    const groups = [];

    for (const docSnap of querySnapshot.docs) {
      const groupData = { id: docSnap.id, ...docSnap.data() };
      
      // Filter active groups in code
      if (groupData.isActive !== false) {
        // Calculate user's balance in this group
        const balance = await calculateUserBalanceInGroup(groupData.id, currentUser.uid);
        groupData.userBalance = balance;
        
        groups.push(groupData);
      }
    }

    // Sort by updatedAt in code
    groups.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return { success: true, data: groups };
  } catch (error) {
    console.error('Error getting user groups:', error);
    return { success: false, error: error.message };
  }
};

// Calculate user's balance in a specific group
export const calculateUserBalanceInGroup = async (groupId, userId) => {
  try {
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId)
    );
    
    const expensesSnapshot = await getDocs(expensesQuery);
    let totalOwed = 0;
    let totalPaid = 0;

    expensesSnapshot.forEach((doc) => {
      const expense = doc.data();
      
      if (expense.paidBy === userId) {
        totalPaid += expense.amount;
      }
      
      if (expense.splitDetails && expense.splitDetails[userId]) {
        totalOwed += expense.splitDetails[userId].amount || 0;
      }
    });

    return totalPaid - totalOwed;
  } catch (error) {
    console.error('Error calculating balance:', error);
    return 0;
  }
};

// Get group details with expenses and balances (simplified)
export const getGroupDetails = async (groupId) => {
  try {
    const docRef = doc(db, 'groups', groupId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: 'Group not found' };
    }

    const groupData = { id: docSnap.id, ...docSnap.data() };
    
    // Get group expenses
    try {
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('groupId', '==', groupId)
      );
      
      const expensesSnapshot = await getDocs(expensesQuery);
      const expenses = [];
      
      expensesSnapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() });
      });
      
      expenses.sort((a, b) => {
        const aDate = a.date?.toMillis?.() || 0;
        const bDate = b.date?.toMillis?.() || 0;
        return bDate - aDate;
      });
      
      groupData.expenses = expenses;
    } catch (error) {
      console.error('Error loading group expenses:', error);
      groupData.expenses = [];
    }
    
    // Calculate balances between members
    groupData.balances = await calculateGroupBalances(groupId, groupData.members);

    return { success: true, data: groupData };
  } catch (error) {
    console.error('Error getting group details:', error);
    return { success: false, error: error.message };
  }
};

// Calculate balances between all group members
export const calculateGroupBalances = async (groupId, members) => {
  try {
    const balances = [];
    
    for (const memberId of members) {
      const balance = await calculateUserBalanceInGroup(groupId, memberId);
      if (balance !== 0) {
        balances.push({
          userId: memberId,
          amount: balance
        });
      }
    }
    
    return balances;
  } catch (error) {
    console.error('Error calculating group balances:', error);
    return [];
  }
};

// Add member to group
export const addMemberToGroup = async (groupId, memberEmail) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Find user by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', memberEmail.toLowerCase())
    );
    const userSnapshot = await getDocs(usersQuery);

    if (userSnapshot.empty) {
      return { success: false, error: 'User not found with this email' };
    }

    const memberDoc = userSnapshot.docs[0];
    const memberData = memberDoc.data();
    const memberId = memberDoc.id;

    // Get group details
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      return { success: false, error: 'Group not found' };
    }

    const groupData = groupSnap.data();

    // Check if user is already a member
    if (groupData.members.includes(memberId)) {
      return { success: false, error: 'User is already a member of this group' };
    }

    // Add member to group
    await updateDoc(groupRef, {
      members: arrayUnion(memberId),
      [`memberDetails.${memberId}`]: {
        name: memberData.displayName || 'User',
        email: memberData.email,
        photoURL: memberData.photoURL || ''
      },
      updatedAt: createTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding member to group:', error);
    return { success: false, error: error.message };
  }
};

// Remove member from group
export const removeMemberFromGroup = async (groupId, memberId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      return { success: false, error: 'Group not found' };
    }

    const groupData = groupSnap.data();

    // Check if current user is the creator
    if (groupData.createdBy !== currentUser.uid) {
      return { success: false, error: 'Only group creator can remove members' };
    }

    // Can't remove the creator
    if (memberId === groupData.createdBy) {
      return { success: false, error: 'Cannot remove group creator' };
    }

    // Remove member from group
    const updatedMemberDetails = { ...groupData.memberDetails };
    delete updatedMemberDetails[memberId];

    await updateDoc(groupRef, {
      members: arrayRemove(memberId),
      memberDetails: updatedMemberDetails,
      updatedAt: createTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing member from group:', error);
    return { success: false, error: error.message };
  }
};

// Update group details
export const updateGroup = async (groupId, updateData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      return { success: false, error: 'Group not found' };
    }

    const groupData = groupSnap.data();

    // Check if current user is a member
    if (!groupData.members.includes(currentUser.uid)) {
      return { success: false, error: 'You are not a member of this group' };
    }

    await updateDoc(groupRef, {
      ...updateData,
      updatedAt: createTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating group:', error);
    return { success: false, error: error.message };
  }
};

// Delete group completely
export const deleteGroup = async (groupId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      return { success: false, error: 'Group not found' };
    }

    const groupData = groupSnap.data();

    // Check if current user is the creator
    if (groupData.createdBy !== currentUser.uid) {
      return { success: false, error: 'Only group creator can delete the group' };
    }

    // Delete all expenses associated with this group
    const expensesQuery = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId)
    );
    
    const expensesSnapshot = await getDocs(expensesQuery);
    const deletePromises = [];
    
    expensesSnapshot.forEach((expenseDoc) => {
      deletePromises.push(deleteDoc(doc(db, 'expenses', expenseDoc.id)));
    });
    
    // Wait for all expenses to be deleted
    await Promise.all(deletePromises);

    // Delete the group document
    await deleteDoc(groupRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting group:', error);
    return { success: false, error: error.message };
  }
};

// Listen to user groups in real-time (simplified query)
export const listenToUserGroups = (callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    callback([]);
    return () => {};
  }

  // Simplified query - only filter by members, then filter isActive in code
  const q = query(
    collection(db, 'groups'),
    where('members', 'array-contains', currentUser.uid)
  );

  return onSnapshot(q, async (querySnapshot) => {
    const groups = [];
    
    for (const docSnap of querySnapshot.docs) {
      const groupData = { id: docSnap.id, ...docSnap.data() };
      
      // Filter active groups in code instead of query
      if (groupData.isActive !== false) {
        // Calculate user's balance in this group
        const balance = await calculateUserBalanceInGroup(groupData.id, currentUser.uid);
        groupData.userBalance = balance;
        
        groups.push(groupData);
      }
    }
    
    // Sort by updatedAt in code
    groups.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    callback(groups);
  }, (error) => {
    console.error('Error in groups listener:', error);
    callback([]);
  });
};

// Search users by exact email match (more secure approach)
export const searchUsersByEmail = async (emailQuery) => {
  try {
    if (!emailQuery || emailQuery.length < 3) {
      return { success: true, data: [] };
    }

    // Only search for exact email matches to avoid permission issues
    // This is more secure as users can only find people they know the exact email of
    const q = query(
      collection(db, 'users'),
      where('email', '==', emailQuery.toLowerCase())
    );

    const querySnapshot = await getDocs(q);
    const users = [];

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        name: userData.displayName || 'User',
        email: userData.email,
        photoURL: userData.photoURL || ''
      });
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Error searching users:', error);
    return { success: false, error: error.message };
  }
};