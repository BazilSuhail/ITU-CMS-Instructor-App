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
                    headerShown: false 
                }}
            />
           <Stack.Screen
                name="MarksOfSubject"
                component={MarksOfSubject}
                options={({ route }) => ({
                    title: route.params?.courseName || 'Marks Of Subject', 
                    headerStyle: {
                        backgroundColor: '#001433', 
                    },
                    headerTintColor: '#FFFFFF', 
                })}
            />
        </Stack.Navigator>
    );
};

export default Marks;
