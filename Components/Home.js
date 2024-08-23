import React from 'react';
import { createStackNavigator, } from '@react-navigation/stack';
import StudentList from './StudentList';
import Students from './Students';
import Signin from './Signin';

const Stack = createStackNavigator();

const Courses = () => {
    return (
        <Stack.Navigator initialRouteName="Students">
            <Stack.Screen
                name="Students"
                component={Students}
                options={{
                    title: 'Students',
                    headerShown: false 
                }}
            />
            <Stack.Screen
                name="StudentList"
                component={StudentList}
                options={{
                    title: 'Student List',
                    headerShown: false 
                }}
            />
            <Stack.Screen
                name="Signin"
                component={Signin}
                options={{
                    title: 'StudentList',
                    headerShown: false 
                }}
            />
        </Stack.Navigator>
    );
};

export default Courses;
