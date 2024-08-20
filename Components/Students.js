import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, ImageBackground,Image, Modal, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, fs } from '../Config/Config';
import itu from "../assets/itu.png";
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons from Expo

import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import img4 from "../assets/img4.jpg";
import img5 from "../assets/img5.jpg";

const Students = () => {
    const [courses, setCourses] = useState([]);
    const [instructorName, setInstructorName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // State to manage modal visibility
    const navigation = useNavigation();

    const images = [img1, img2, img3, img4, img5];

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);

            try {
                const currentUser = auth.currentUser;

                if (currentUser) {
                    // Fetch instructor's name
                    const instructorDoc = await fs.collection('instructors').doc(currentUser.uid).get();
                    if (instructorDoc.exists) {
                        const fullName = instructorDoc.data().name || '';
                        // Extract the first two words
                        const nameParts = fullName.split(' ');
                        const shortName = nameParts.slice(0, 2).join(' ');
                        setInstructorName(shortName);
                    } else {
                        setError('Instructor not found');
                    }

                    // Fetch assigned courses
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

    const [animation] = useState(new Animated.Value(-300)); // Start position off-screen

    useEffect(() => {
        if (isModalVisible) {
            // Slide in animation
            Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // Slide out animation
            Animated.timing(animation, {
                toValue: -300,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isModalVisible]);

    const handleNavigateToCourse = (assignCourseId) => {
        navigation.navigate('StudentList', { assignCourseId });
    };

    const handleLogout = () => {
        auth.signOut()
            .then(() => {
                navigation.navigate('Signin'); // Navigate to sign-in page
                setIsModalVisible(false); // Hide the modal
            })
            .catch((error) => {
                console.error('Error signing out:', error);
            });
    };

    const renderCourseItem = (item, index) => {
        const image = images[index % images.length]; // Select image based on index
    
        return (
            <TouchableOpacity
                key={item.assignCourseId}  // Unique key prop
                onPress={() => handleNavigateToCourse(item.assignCourseId)}
                className="rounded-lg m-1"
            >
                <ImageBackground
                    source={image}
                    resizeMode="cover"
                    className="flex justify-between h-[120px] rounded-lg py-4 px-3"
                    imageStyle={{ borderRadius: 10 }}  // Ensure the image respects the border radius
                >
                    <Text className="text-xl font-medium text-white my-2">
                        {item.courseName}
                    </Text>
    
                    <View className="flex-row justify-between items-center">
                        <Text className="text-md text-gray-300 font-medium">
                            {item.className}
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-white text-sm">Credit.Hrs:</Text>
                            <Text className="font-extrabold text-sm bg-gray-300 text-center px-2 ml-1 text-blue-950 rounded-md">
                                {item.creditHours}
                            </Text>
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    };
    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="w-screen pt-[45px] bg-custom-blue h-[105px] flex-row justify-between items-center px-2">
                <Image source={itu} className="w-[40px] h-[40px]" />

                <TouchableOpacity onPress={() => setIsModalVisible(true)} className="p-2">
                    <MaterialIcons name="logout" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View className="px-2">
                {instructorName ? (
                    <Text className="text-3xl font-bold text-blue-800 mt-5">
                        <Text className="text-2xl text-blue-950">Hi,</Text> {instructorName}
                    </Text>
                ) : null}
                <View className="w-[100%] h-[2px] bg-blue-800 self-center my-4"></View>

                {loading ? (
                    <View className="flex-1 h-screen justify-center items-center">
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

            {/* Modal for logout confirmation */}
            <Modal
                transparent={true}
                visible={isModalVisible || animation.interpolate({ inputRange: [-300, 0], outputRange: [true, false] })}
                animationType="none" // Disable default animation
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-[gray]/50">
                    <Animated.View
                        style={{
                            transform: [{ translateX: animation }],
                        }}
                        className="bg-white p-6 rounded-lg shadow-lg"
                    >
                        <Text className="text-lg font-bold mb-4">Logout</Text>
                        <Text className="mb-4">Are you sure you want to logout?</Text>
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-red-500 p-2 rounded-lg"
                        >
                            <Text className="text-white text-center font-bold">Logout</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsModalVisible(false)}
                            className="mt-4"
                        >
                            <Text className="text-blue-500 text-center">Cancel</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default Students;
