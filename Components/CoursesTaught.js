import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, ImageBackground, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, fs } from '../Config/Config';

import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import img4 from "../assets/img4.jpg";
import img5 from "../assets/img5.jpg";

const CoursesTaught = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const images = [img1, img2, img3, img4, img5];

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
                            creditHours: courseDoc.exists ? courseDoc.data().creditHours : 'Unknown Hours',
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
        navigation.navigate('Marking', { assignCourseId });
    };

    const renderCourseItem = (item, index) => {
        const image = images[index % images.length];

        return (
            <ImageBackground
                key={item.assignCourseId}
                source={image}
                resizeMode="cover"
                className="h-[140px] flex flex-col rounded-lg m-[5px] px-[15px] py-[10px]"
                imageStyle={{ borderRadius: 10 }}
            >
                <Text className="text-xl font-medium text-white my-[8px]">{item.courseName}</Text>

                <View className="flex-row mt-[3px] mb-[5px] justify-between items-center">
                    <Text className="text-[16px] text-gray-200 font-bold">{item.className}</Text>
                    <View className="flex-row">
                        <Text className="text-white text-[12px]"> Credit.Hrs: </Text>
                        <Text className="font-extrabold text-[12px] bg-gray-300 text-center px-[8px] ml-[4px] text-blue-950 rounded-md ">
                            {item.creditHours}
                        </Text>
                    </View>
                </View>

                <View className="ml-auto mt-[8px] flex-row">
                    <TouchableOpacity onPress={() => handleNavigateToCourse(item.assignCourseId)} className="font-medium mr-[8px] bg-red-900 px-[8px] py-[4px] rounded-md">
                        <Text className="text-white text-[15px] text-center">Mark Attendance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleNavigateToMarkingCourse(item.assignCourseId)} className="font-medium bg-green-800 px-[8px] py-[4px] rounded-md">
                        <Text className="text-white text-[15px] text-center">Grade Students</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    };

    return (
        <>
            <StatusBar
                backgroundColor='#f3f4f6'
                barStyle='light-content'
            />
            <ScrollView className="h-full w-full px-[8px] bg-gray-100">
                <View>
                    <Text className="text-custom-blue text-2xl font-bold ml-[2px]">Courses:</Text>

                    <View className="border-2 border-gray-300 h-[105px] flex flex-col justify-between rounded-lg m-[5px] text-white px-[15px] py-[15px]" >
                        <Text className="text-xl font-bold text-blue-950 ">This Week</Text>
                        <Text className="text-[14px]  text-gray-400 font-bold">This week no work coming up immediately.</Text>
                    </View>

                    {loading ? (
                        <View className="flex h-screen items-center justify-center">
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                    ) : error ? (
                        <View className="flex-1 justify-center items-center">
                            <Text>Error: {error}</Text>
                        </View>
                    ) : (
                        <View>
                            {courses.length > 0 ? (
                                courses.map((item, index) => renderCourseItem(item, index))
                            ) : (
                                <Text>No courses assigned.</Text>
                            )}
                        </View>
                    )}
                </View>
                <View className="h-[85px]"></View>
            </ScrollView>

        </>
    );
};

export default CoursesTaught;
