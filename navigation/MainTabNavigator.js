import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

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
    <SafeAreaProvider>
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
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
