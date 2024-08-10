import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fs } from '../Config/Config'; // Adjust import as needed

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

                    // Fetch students enrolled in this course
                    const studentsSnapshot = await fs.collection('students').get();
                    const studentsList = studentsSnapshot.docs
                        .filter(doc => doc.data().currentCourses.includes(assignCourseId))
                        .map(async doc => {
                            const studentData = doc.data();
                            const profileUrl = studentData.profileUrl || ''; // Get profile URL

                            // Validate if the profile URL exists
                            let imageUrl = '';
                            if (profileUrl) {
                                try {
                                    const response = await fetch(profileUrl);
                                    if (response.ok) {
                                        imageUrl = profileUrl;
                                    }
                                } catch {
                                    // Handle any errors in fetching the image
                                }
                            }

                            return {
                                id: doc.id,
                                name: studentData.name,
                                rollNumber: studentData.rollNumber,
                                imageUrl: imageUrl,
                            };
                        });

                    const resolvedStudents = await Promise.all(studentsList);
                    setStudents(resolvedStudents);
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
            <View className="flex-1 justify-center items-center bg-gray-100">
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
        <View className="flex-1 pt-[48px] px-4 bg-gray-100">

            <Ionicons name="arrow-back" onPress={() => navigation.goBack()} size={26} color="#003F92" />
            <View className="w-[100%] h-[2px] bg-blue-800 self-center my-4"></View>

            {students.length > 0 ? (
                students.map(student => (
                    <View key={student.id} className="flex-row items-center mb-4">
                        {student.imageUrl ? (
                            <Image
                                source={{ uri: student.imageUrl }}
                                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                            />
                        ) : (
                            <View
                                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'gray', marginRight: 12 }}
                            />
                        )}
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
        </View>
    );
};

export default StudentList;
