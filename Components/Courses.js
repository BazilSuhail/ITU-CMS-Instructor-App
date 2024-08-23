import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator , } from '@react-navigation/stack'; 
import Attendance from './Attendance';
import CoursesTaught from './CoursesTaught';
import Marking from './Marking';

const Stack = createStackNavigator();

const Courses = () => {
    return (
        <Stack.Navigator initialRouteName="CoursesTaught">
            <Stack.Screen
                name="CoursesTaught"
                component={CoursesTaught}
                options={{
                    title: 'CoursesTaught',
                    headerShown: false
                }}
            />
             <Stack.Screen
                name="Attendance"
                component={Attendance}
                options={{
                    title: 'View Attendance',
                    headerShown: false
                }}
            />
            
            <Stack.Screen
                name="Marking"
                component={Marking}
                options={{
                    title: 'View Marks',
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    );
};

export default Courses;
