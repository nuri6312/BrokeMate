// Data Models and Validation for BrokeMate App
import { Timestamp } from 'firebase/firestore';

// User Model
export const UserModel = {
    id: '', // Firebase Auth UID
    email: '',
    displayName: '',
    photoURL: '',
    phoneNumber: '',
    preferences: {
        currency: 'USD',
        notifications: {
            pushEnabled: true,
            emailEnabled: true,
            paymentReminders: true,
            groupActivity: true,
        },
        privacy: {
            profileVisible: true,
            allowFriendRequests: true,
        }
    },
    createdAt: null,
    updatedAt: null,
    lastLoginAt: null,
};

// Group Model
export const GroupModel = {
    id: '',
    name: '',
    description: '',
    imageURL: '',
    createdBy: '', // User ID
    members: [], // Array of user IDs
    memberDetails: {}, // Object with user details for quick access
    totalExpenses: 0,
    currency: 'USD',
    isActive: true,
    createdAt: null,
    updatedAt: null,
};

// Expense Model
export const ExpenseModel = {
    id: '',
    title: '',
    description: '',
    amount: 0,
    currency: 'USD',
    category: '', // 'food', 'transport', 'entertainment', etc.
    paidBy: '', // User ID
    groupId: '', // Group ID (null for personal expenses)
    splitType: 'equal', // 'equal', 'exact', 'percentage'
    splitDetails: {}, // Object with split information
    receiptURL: '',
    date: null,
    createdBy: '', // User ID
    participants: [], // Array of user IDs involved in the expense
    isSettled: false,
    createdAt: null,
    updatedAt: null,
};

// Payment Model (for settling debts)
export const PaymentModel = {
    id: '',
    fromUserId: '',
    toUserId: '',
    amount: 0,
    currency: 'USD',
    groupId: '', // Optional - if payment is for a specific group
    expenseIds: [], // Array of expense IDs this payment settles
    status: 'pending', // 'pending', 'completed', 'cancelled'
    paymentMethod: '', // 'cash', 'venmo', 'paypal', etc.
    notes: '',
    createdAt: null,
    completedAt: null,
};

// Balance Model (calculated balances between users)
export const BalanceModel = {
    id: '',
    userA: '', // User ID
    userB: '', // User ID
    groupId: '', // Group ID (null for overall balance)
    amount: 0, // Positive means userA owes userB, negative means userB owes userA
    currency: 'USD',
    lastUpdated: null,
};

// Notification Model
export const NotificationModel = {
    id: '',
    userId: '', // Recipient user ID
    type: '', // 'expense_added', 'payment_request', 'payment_received', etc.
    title: '',
    message: '',
    data: {}, // Additional data (expense ID, group ID, etc.)
    isRead: false,
    createdAt: null,
};

// Activity Model (for activity feed)
export const ActivityModel = {
    id: '',
    type: '', // 'expense_added', 'expense_updated', 'payment_made', 'group_created', etc.
    userId: '', // User who performed the action
    groupId: '', // Optional - if activity is group-related
    expenseId: '', // Optional - if activity is expense-related
    title: '',
    description: '',
    metadata: {}, // Additional data
    createdAt: null,
};

// Budget Model
export const BudgetModel = {
    id: '',
    userId: '', // User ID who owns the budget
    amount: 0, // Budget amount
    spent: 0, // Amount spent so far
    remaining: 0, // Remaining amount (calculated)
    category: 'general', // Budget category
    month: 0, // Month (1-12)
    year: 0, // Year
    monthName: '', // Month name for display
    currency: 'USD',
    isActive: true,
    createdAt: null,
    updatedAt: null,
};

// Validation Functions
export const validateUser = (userData) => {
    const errors = [];

    if (!userData.email || !isValidEmail(userData.email)) {
        errors.push('Valid email is required');
    }

    if (!userData.displayName || userData.displayName.trim().length < 2) {
        errors.push('Display name must be at least 2 characters');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateGroup = (groupData) => {
    const errors = [];

    if (!groupData.name || groupData.name.trim().length < 1) {
        errors.push('Group name is required');
    }

    if (!groupData.createdBy) {
        errors.push('Group creator is required');
    }

    if (!Array.isArray(groupData.members) || groupData.members.length === 0) {
        errors.push('Group must have at least one member');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateExpense = (expenseData) => {
    const errors = [];

    if (!expenseData.title || expenseData.title.trim().length < 1) {
        errors.push('Expense title is required');
    }

    if (!expenseData.amount || expenseData.amount <= 0) {
        errors.push('Expense amount must be greater than 0');
    }

    if (!expenseData.paidBy) {
        errors.push('Payer is required');
    }

    if (!expenseData.date) {
        errors.push('Expense date is required');
    }

    if (!Array.isArray(expenseData.participants) || expenseData.participants.length === 0) {
        errors.push('Expense must have at least one participant');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validatePayment = (paymentData) => {
    const errors = [];

    if (!paymentData.fromUserId) {
        errors.push('Payer is required');
    }

    if (!paymentData.toUserId) {
        errors.push('Recipient is required');
    }

    if (paymentData.fromUserId === paymentData.toUserId) {
        errors.push('Payer and recipient cannot be the same');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
        errors.push('Payment amount must be greater than 0');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateBudget = (budgetData) => {
    const errors = [];

    if (!budgetData.userId) {
        errors.push('User ID is required');
    }

    if (!budgetData.amount || budgetData.amount <= 0) {
        errors.push('Budget amount must be greater than 0');
    }

    if (!budgetData.month || budgetData.month < 1 || budgetData.month > 12) {
        errors.push('Valid month is required (1-12)');
    }

    if (!budgetData.year || budgetData.year < 2020) {
        errors.push('Valid year is required');
    }

    if (!budgetData.category) {
        errors.push('Budget category is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Helper Functions
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const createTimestamp = () => {
    return Timestamp.now();
};

export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

// Expense Categories
export const EXPENSE_CATEGORIES = [
    { id: 'food', name: 'Food & Dining', icon: 'restaurant-outline' },
    { id: 'transport', name: 'Transportation', icon: 'car-outline' },
    { id: 'entertainment', name: 'Entertainment', icon: 'game-controller-outline' },
    { id: 'shopping', name: 'Shopping', icon: 'bag-outline' },
    { id: 'bills', name: 'Bills & Utilities', icon: 'receipt-outline' },
    { id: 'groceries', name: 'Groceries', icon: 'basket-outline' },
    { id: 'travel', name: 'Travel', icon: 'airplane-outline' },
    { id: 'health', name: 'Health & Medical', icon: 'medical-outline' },
    { id: 'education', name: 'Education', icon: 'school-outline' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal-outline' },
];

// Split Types
export const SPLIT_TYPES = {
    EQUAL: 'equal',
    EXACT: 'exact',
    PERCENTAGE: 'percentage',
};

// Payment Status
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

// Notification Types
export const NOTIFICATION_TYPES = {
    EXPENSE_ADDED: 'expense_added',
    EXPENSE_UPDATED: 'expense_updated',
    EXPENSE_DELETED: 'expense_deleted',
    PAYMENT_REQUEST: 'payment_request',
    PAYMENT_RECEIVED: 'payment_received',
    GROUP_INVITATION: 'group_invitation',
    GROUP_UPDATED: 'group_updated',
    REMINDER: 'reminder',
};

// Activity Types
export const ACTIVITY_TYPES = {
    EXPENSE_ADDED: 'expense_added',
    EXPENSE_UPDATED: 'expense_updated',
    EXPENSE_DELETED: 'expense_deleted',
    PAYMENT_MADE: 'payment_made',
    GROUP_CREATED: 'group_created',
    GROUP_UPDATED: 'group_updated',
    MEMBER_ADDED: 'member_added',
    MEMBER_REMOVED: 'member_removed',
};