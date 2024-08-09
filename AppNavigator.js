// Navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import HomeScreen from './Components/Home';
import CoursesScreen from './Components/Courses';
import ProfileScreen from './Components/Profile';

const Tab = createBottomTabNavigator();

const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome);

function AppNavigator() {
  const { colors } = useTheme();

  return ( 
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Courses') {
              iconName = 'book';
            } else if (route.name === 'Profile') {
              iconName = 'user';
            }

            // Animated size and opacity for active tab
            const animatedSize = focused ? 30 : 24;
            const animatedOpacity = focused ? 1 : 0.7;

            return (
              <AnimatedIcon
                name={iconName}
                size={animatedSize}
                color={color}
                style={{
                  opacity: animatedOpacity,
                  transform: [{ scale: animatedSize / 24 }], // Scale animation
                }}
              />
            );
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'darkgray',
          tabBarStyle: {
            backgroundColor: 'black', // Set background color for tab bar
          },
          headerShown: false, // Hide the header
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Courses" component={CoursesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator> 
  );
}

export default AppNavigator;
