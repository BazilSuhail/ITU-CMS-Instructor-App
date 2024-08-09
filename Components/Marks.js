import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ViewMarks from './ViewMarks';
import MarksOfSubject from './MarksOfSubject';

const Stack = createStackNavigator();

const Marks = () => {
    return (
        <Stack.Navigator initialRouteName="ViewMarks">
            <Stack.Screen
                name="ViewMarks"
                component={ViewMarks}
                options={{
                    title: 'View Marks',
                    headerShown: false // Hide the header for this screen
                }}
            />
           <Stack.Screen
                name="MarksOfSubject"
                component={MarksOfSubject}
                options={({ route }) => ({
                    title: route.params?.courseName || 'Marks Of Subject', // Fallback title
                    headerStyle: {
                        backgroundColor: '#001433', // Custom background color for this screen
                    },
                    headerTintColor: '#FFFFFF', // Custom text color for this screen
                })}
            />
        </Stack.Navigator>
    );
};

export default Marks;
