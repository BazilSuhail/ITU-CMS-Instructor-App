import React from 'react'; 
import { createStackNavigator , } from '@react-navigation/stack'; 
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
                    headerShown: false // Hide the header for this screen
                }}
            />
             <Stack.Screen
                name="StudentList"
                component={StudentList}
                options={{
                    title: 'Student List',
                    headerShown: false // Hide the header for this screen
                }}
        />
          <Stack.Screen
                name="Signin"
                component={Signin}
                options={{
                    title: 'StudentList',
                    headerShown: false // Hide the header for this screen
                }}
            />
        </Stack.Navigator>
    );
};

export default Courses;
