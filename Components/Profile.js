import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native'; 
import { auth, fs } from '../Config/Config';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]); 

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const docRef = await fs.collection('instructors').doc(currentUser.uid).get();
          if (docRef.exists) {
            setUserData(docRef.data());
            const assignCoursesSnapshot = await fs.collection('assignCourses')
              .where('instructorId', '==', currentUser.uid)
              .get();

            const assignedCoursesData = await Promise.all(assignCoursesSnapshot.docs.map(async doc => {
              const assignment = doc.data();
              const courseDoc = await fs.collection('courses').doc(assignment.courseId).get();
              const classDoc = await fs.collection('classes').doc(assignment.classId).get();

              return {
                assignCourseId: doc.id,
                courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                creditHours: courseDoc.exists ? courseDoc.data().creditHours : 'Unknown Hours',
                courseId: assignment.courseId,
                classId: assignment.classId
              };
            }));

            setAssignedCourses(assignedCoursesData);
          } else {
            setError('No user data found');
          }
        } else {
          setError('No authenticated user found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const renderCourseItem = ({ item }) => (
    <View className="bg-blue-800 rounded-lg p-4 mb-2 items-center">
      <Text className="text-lg font-bold text-white mb-2">{item.courseName}</Text>
      <Text className="text-base text-gray-300">{item.className}</Text>
      <Text className="text-base text-gray-300">Credit Hours: {item.creditHours}</Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      {userData ? (
        <View className="flex-1">
          <Text className="text-2xl font-bold text-blue-900 text-center mb-4">
            Hi, <Text className="text-blue-700">{userData.name}</Text>!
          </Text>
          <View className="mb-4">
            <View className="bg-blue-800 rounded-lg p-4 mb-2">
              <Text className="text-base text-white">Name:</Text>
              <Text className="text-xl font-bold text-white">{userData.name}</Text>
            </View>
            <View className="bg-blue-800 rounded-lg p-4 mb-2">
              <Text className="text-base text-white">Registered Email:</Text>
              <Text className="text-xl font-bold text-white">{userData.email}</Text>
            </View>
            <View className="bg-blue-800 rounded-lg p-4 mb-2">
              <Text className="text-base text-white">Contact:</Text>
              <Text className="text-xl font-bold text-white">{userData.phone}</Text>
            </View>
          </View>
          <Text className="text-xl font-bold text-blue-900 mb-4">Courses Teaching:</Text>
          <FlatList
            data={assignedCourses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.assignCourseId}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </View>
      ) : (
        <Text>No user data available</Text>
      )}
    </View>
  );
};

export default ProfileScreen;
