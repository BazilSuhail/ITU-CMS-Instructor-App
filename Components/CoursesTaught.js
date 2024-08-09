import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, fs } from '../Config/Config';

const CoursesTaught = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);

            try {
                const currentUser = auth.currentUser;

                if (currentUser) {
                    const assignCoursesSnapshot = await fs.collection('assignCourses')
                        .where('instructorId', '==', currentUser.uid)
                        .get();

                    const coursesData = await Promise.all(assignCoursesSnapshot.docs.map(async doc => {
                        const assignment = doc.data();
                        const courseDoc = await fs.collection('courses').doc(assignment.courseId).get();
                        const classDoc = await fs.collection('classes').doc(assignment.classId).get();

                        return {
                            assignCourseId: doc.id,
                            courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                            className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                            courseId: assignment.courseId,
                            classId: assignment.classId
                        };
                    }));

                    setCourses(coursesData);
                } else {
                    setError('No authenticated user found');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleNavigateToCourse = (assignCourseId) => {
        navigation.navigate('Attendance', { assignCourseId });
    };

    const handleNavigateToMarkingCourse = (assignCourseId) => {
        navigation.navigate('GradeStudents', { assignCourseId });
    };

    const renderCourseItem = ({ item }) => (
        <View className="bg-custom-blue flex flex-col rounded-lg m-[5px] text-white p-[15px]" >
            <View className="bg-gray-500 mt-[15px] rounded-lg mx-auto w-[100%] h-[230px]"></View>
            <Text className="text-2xl font-bold my-[8px] ml-[5px]">{item.courseName}</Text>
            <Text className="text-md text-gray-400 font-bold">{item.className}</Text>
            <TouchableOpacity onPress={() => handleNavigateToCourse(item.assignCourseId)} className="mx-auto w-[100%] font-bold hover:bg-custom-back-grey my-[8px] bg-red-600 p-[8px] rounded-xl">
                <Text className="text-white text-center">Mark Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigateToMarkingCourse(item.assignCourseId)} className="mx-auto w-[100%] font-bold hover:bg-custom-back-grey my-[8px] bg-green-700 p-[8px] rounded-xl">
                <Text className="text-white text-center">Grade Students</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="h-full w-full p-[10px] bg-white">
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center">
                    <Text>Error: {error}</Text>
                </View>
            ) : (
                <View>
                    <Text className="text-custom-blue text-2xl font-bold my-[12px] ml-[10px]">Courses:</Text>
                    {courses.length > 0 ? (
                        <FlatList
                            data={courses}
                            renderItem={renderCourseItem}
                            keyExtractor={(item) => item.assignCourseId}
                            contentContainerStyle={{ flexGrow: 1 }}
                        />
                    ) : (
                        <Text>No courses assigned.</Text>
                    )}
                </View>
            )}
        </View>
    );
};

export default CoursesTaught;
