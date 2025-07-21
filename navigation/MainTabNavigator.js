import React from 'react';
import { Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import DashboardScreen from '../screens/DashboardScreen';
import GroupsScreen from '../screens/GroupsScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ user }) {
  // Create wrapper components to pass user prop
  const DashboardWrapper = (props) => <DashboardScreen {...props} user={user} />;
  const GroupsWrapper = (props) => <GroupsScreen {...props} user={user} />;
  const ActivityWrapper = (props) => <ActivityScreen {...props} user={user} />;
  const ProfileWrapper = (props) => <ProfileScreen {...props} user={user} />;
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e5e7eb',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? hp('11%') : hp('8%'),
            paddingBottom: Platform.OS === 'ios' ? hp('2.5%') : hp('1%'),
            paddingTop: hp('1%'),
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 8,
              },
            }),
          },
          tabBarLabelStyle: {
            fontSize: Platform.OS === 'ios' ? wp('2.8%') : wp('3%'),
            fontWeight: '600',
            marginBottom: Platform.OS === 'ios' ? 0 : hp('0.3%'),
          },
          tabBarIconStyle: {
            marginBottom: Platform.OS === 'ios' ? hp('0.3%') : hp('0.5%'),
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardWrapper}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: Platform.OS === 'ios' ? wp('6%') : size, color }}>🏠</Text>
            ),
          }}
        />
        
        <Tab.Screen
          name="Groups"
          component={GroupsWrapper}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: Platform.OS === 'ios' ? wp('6%') : size, color }}>👥</Text>
            ),
          }}
        />
        
        <Tab.Screen
          name="Activity"
          component={ActivityWrapper}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: Platform.OS === 'ios' ? wp('6%') : size, color }}>🔔</Text>
            ),
          }}
        />
        
        <Tab.Screen
          name="Profile"
          component={ProfileWrapper}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: Platform.OS === 'ios' ? wp('6%') : size, color }}>👤</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}