import React from 'react';
import { Text, Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import DashboardScreen from '../screens/DashboardScreen';
import GroupsScreen from '../screens/GroupsScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExpenseScreen from '../screens/ExpenseScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ user }) {
  // Create wrapper components to pass user prop
  const DashboardWrapper = (props) => <DashboardScreen {...props} user={user} />;
  const GroupsWrapper = (props) => <GroupsScreen {...props} user={user} />;
  const ActivityWrapper = (props) => <ActivityScreen {...props} user={user} />;
  const ExpenseWrapper = (props) => <ExpenseScreen {...props} user={user} />;
  const ProfileWrapper = (props) => <ProfileScreen {...props} user={user} />;

  // Custom tab bar icon component
  const TabIcon = ({ name, focused }) => {
    const getIcon = () => {
      switch (name) {
        case 'Dashboard':
          return focused ? '🏠' : '🏠';
        case 'Groups':
          return focused ? '👥' : '👥';
        case 'Expense':
          return focused ? '💰' : '💰';
        case 'Activity':
          return focused ? '🔔' : '🔔';
        case 'Profile':
          return focused ? '👤' : '👤';
        default:
          return '⚪';
      }
    };

    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ 
          fontSize: wp('6%'), 
          opacity: focused ? 1 : 0.4,
          marginBottom: 2
        }}>
          {getIcon()}
        </Text>
      </View>
    );
  };
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e5e7eb',
            borderTopWidth: 0.5,
            height: Platform.OS === 'ios' ? hp('10%') : hp('8%'),
            paddingBottom: Platform.OS === 'ios' ? hp('2%') : hp('1%'),
            paddingTop: hp('1%'),
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: wp('3%'),
            fontWeight: '400',
            marginTop: 2,
          },
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardWrapper}
        />
        
        <Tab.Screen
          name="Groups"
          component={GroupsWrapper}
        />
        
        <Tab.Screen
          name="Expense"
          component={ExpenseWrapper}
        />
        
        <Tab.Screen
          name="Activity"
          component={ActivityWrapper}
        />
        
        <Tab.Screen
          name="Profile"
          component={ProfileWrapper}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
