// Navigation.js
import React from 'react'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

import { Text } from 'react-native';
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
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Courses') {
            iconName = 'book';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

          // Animated size and opacity for active tab
          const animatedSize = focused ? 28 : 27;
          const animatedOpacity = focused ? 1 : 0.7;

          return (
            <AnimatedIcon
              name={iconName}
              size={animatedSize}
              color={focused ? '#003891' : '#474747'} // Darker grayish color for icons
              style={{
                opacity: animatedOpacity,
                transform: [{ scale: animatedSize / 24 }], // Scale animation
                padding: 5, // Padding around the icons
              }}
            />
          );
        },
        tabBarLabel: ({ focused, color }) => {
          return (
            <Text
              style={{
                fontSize: 14, // Increase font size
                color: focused ? '#003891' : '#474747', // Text color based on focus 
                fontWeight: 600
              }}
            >
              {route.name}
            </Text>
          );
        },
        tabBarItemStyle: {
          paddingVertical: 3, // Padding around the item
        },
        tabBarStyle: {
          backgroundColor: 'white', // Set background color for tab bar
          height: 60, // Increase tab bar height
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
