import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import GroupsScreen from '../screens/GroupsScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ExpenseDetailsScreen from '../screens/ExpenseDetailsScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import NewGroupScreen from '../screens/NewGroupScreen';
import AddMembersScreen from '../screens/AddMembersScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import GroupSettingsScreen from '../screens/GroupSettingsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettleBalancesScreen from '../screens/SettleBalancesScreen';
import CreateBudgetScreen from '../screens/CreateBudgetScreen';
import UpdateBudgetScreen from '../screens/UpdateBudgetScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator({ user }) {
  // Create wrapper components to pass user prop
  const DashboardWrapper = (props) => <DashboardScreen {...props} user={user} />;
  const GroupsWrapper = (props) => <GroupsScreen {...props} user={user} />;
  const ActivityWrapper = (props) => <ActivityScreen {...props} user={user} />;
  const ProfileWrapper = (props) => <ProfileScreen {...props} user={user} />;
  const ExpenseWrapper = (props) => <ExpenseScreen {...props} user={user} />;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          height: hp('10%'),
          paddingBottom: hp('1.5%'),
          paddingTop: hp('1%'),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: wp('3%'),
          fontWeight: '600',
          marginBottom: hp('0.3%'),
        },
        tabBarIconStyle: {
          marginBottom: hp('0.5%'),
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardWrapper}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Groups"
        component={GroupsWrapper}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpenseWrapper}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size + 4} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Activity"
        component={ActivityWrapper}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileWrapper}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainTabNavigator({ user }) {
  // Create wrapper for AddExpenseScreen
  const AddExpenseWrapper = (props) => <AddExpenseScreen {...props} user={user} route={props.route} />;
  // Create wrapper for ExpenseScreen
  const ExpenseWrapper = (props) => <ExpenseScreen {...props} user={user} />;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            presentation: 'modal',
          }}
        >
          <Stack.Screen name="MainTabs">
            {(props) => <TabNavigator {...props} user={user} />}
          </Stack.Screen>
          <Stack.Screen
            name="AddExpense"
            component={AddExpenseWrapper}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ExpenseDetails"
            component={ExpenseDetailsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Expense"
            component={ExpenseWrapper}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="NewGroup"
            component={NewGroupScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AddMembers"
            component={AddMembersScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="GroupDetails"
            component={GroupDetailsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="GroupSettings"
            component={GroupSettingsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="SettleBalances"
            component={SettleBalancesScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="CreateBudget"
            component={CreateBudgetScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="UpdateBudget"
            component={UpdateBudgetScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}