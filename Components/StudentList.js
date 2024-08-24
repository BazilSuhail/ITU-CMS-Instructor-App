import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fs } from '../Config/Config';

import { Ionicons } from '@expo/vector-icons';

const StudentList = ({ route }) => {
    const { assignCourseId } = route.params;
    const navigation = useNavigation();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentList = async () => {
            setLoading(true);
            setError(null);

            try {
                const assignmentDoc = await fs.collection('assignCourses').doc(assignCourseId).get();
                if (assignmentDoc.exists) {
                    const assignmentData = assignmentDoc.data();
                    const studentsSnapshot = await fs.collection('students').get();
                    const studentsList = studentsSnapshot.docs
                        .filter(doc => doc.data().currentCourses.includes(assignCourseId))
                        .map(doc => ({
                            id: doc.id,
                            name: doc.data().name,
                            rollNumber: doc.data().rollNumber,
                        }));

                    setStudents(studentsList);
                } else {
                    setError('No assignment data found');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentList();
    }, [assignCourseId]);

    if (loading) {
        return (
            <View className="flex-1 h-screen justify-center items-center bg-gray-100">
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <Text className="text-red-600">{error}</Text>
            </View>
        );
    }

    return (
        <>
            <StatusBar
                backgroundColor='#f3f4f6'
                barStyle='light-content'
            />
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-2 px-4 bg-gray-100">

                <Ionicons name="arrow-back" onPress={() => navigation.goBack()} size={26} color="#003F92" />
                <View className="w-[100%] h-[2px] bg-blue-800 self-center my-3"></View>

                {students.length > 0 ? (
                    students.map(student => (
                        <View key={student.id} className="mb-4 flex-row items-center">
                            <View className="w-[35px] overflow-hidden rounded-full mr-[15px] h-[35px] bg-gray-400">
                                <View className="w-[12px] rounded-full mt-[5px] ml-[11px] h-[12px] bg-gray-700"></View>
                                <View className="w-[25px] rounded-full ml-[5px] mt-[4px] h-[20px] bg-gray-600"></View>
                            </View>

                            <View>
                                <Text className="text-lg font-bold">{student.name}</Text>
                                <Text className="text-gray-600">{student.rollNumber}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text className="text-center text-gray-600">No students enrolled in this course</Text>
                )}
                <View className="h-[85px]"></View>
            </ScrollView>

        </>
    );
};

export default StudentList;
