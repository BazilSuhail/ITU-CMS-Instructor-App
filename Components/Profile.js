import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView } from 'react-native';
import { auth, fs } from '../Config/Config';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          } else {
            setError('No data found for the current user');
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-gray-600">Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: '#f5f5f5' }}>
      <View className="flex-1 px-4 pt-[52px]">
        {userData ? (
          <View className="flex-1">
            <View className="items-center py-[10px] bg-custom-card-blue rounded-xl mb-6">
              <Image 
                source={{ uri: userData.profileUrl }} 
                style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#ddd' }} 
              />
              <Text className="text-2xl font-semibold text-gray-400 mt-4">
                Hi, <Text className="text-gray-50 un">{userData.name} </Text>!
              </Text>
            </View>
            <View>
              <ProfileDetail label="Name" value={userData.name} />
              <ProfileDetail label="Email" value={userData.email} />
              <ProfileDetail label="Contact" value={userData.phone} />
              <ProfileDetail label="City" value={userData.city} />
              <ProfileDetail label="Nationality" value={userData.nationality} />
              <ProfileDetail label="Address" value={userData.address} />
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">No user data available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const ProfileDetail = ({ label, value }) => (
  <View className="bg-white rounded-lg shadow-md p-4 mb-4">
    <Text className="text-gray-600 text-sm">{label}</Text>
    <Text className="text-gray-800 text-lg font-semibold">{value}</Text>
  </View>
);

export default ProfileScreen;
