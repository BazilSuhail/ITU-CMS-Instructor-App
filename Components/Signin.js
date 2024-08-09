import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Linking,TextInput, TouchableOpacity, Image, Keyboard, Animated } from 'react-native';
import { auth } from '../Config/Config'; // Adjust the path as needed  
import { MaterialIcons } from '@expo/vector-icons'; // For Expo users
import itu from "../assets/itu.png"; 

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const marginTopAnim = useRef(new Animated.Value(0)).current; // Initialize marginTop animation

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(marginTopAnim, {
        toValue: -350,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(marginTopAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [marginTopAnim]);

  const handleSignIn = async () => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      setError(error.message);
    }
  };
  const handlePress = () => {
    Linking.openURL("https://itu-cms.netlify.app/").catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <View className="flex-1  bg-custom-blue">
      <Image
        source={itu}
        className="w-[250px] h-[250px] mx-auto mt-[80px] mb-[55px]"
      />

      <Animated.View style={{ width: '100%', backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 28, flex: 1, justifyContent: 'center', marginTop: marginTopAnim }}>
        <Text className="text-[32px] font-bold text-blue-950 mt-[-35px] mb-[25px] text-center">Sign In</Text>
        <Text className="text-md mb-[8px] font-medium">
          LogIn with <Text className="text-blue-700 font-semibold">Provided Credidentials</Text>
       </Text>
        {error ? <Text className="text-red-400 mb-4">{error}</Text> : null}

        <View className="flex-row items-center border border-gray-400 py-2 rounded-xl px-4 mb-4">
          <MaterialIcons
            name="email"
            size={24}
            color="gray"
            className="ml-3"
          />
          <TextInput
            className="flex-1 text-lg bg-white text-black pl-3"
            placeholder="Email"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View className="flex-row items-center border border-gray-400 py-2 rounded-xl px-4 mb-4">
          <MaterialIcons
            name="lock"
            size={24}
            color="gray"
            className="ml-3"
          />
          <TextInput
            className="flex-1 text-lg bg-white text-black pl-3"
            placeholder="Password"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity
          onPress={handleSignIn}
          className="bg-blue-900 rounded-xl py-2"
        >
          <Text className="text-2xl text-center text-white font-bold">
            Sign In
          </Text>
        </TouchableOpacity>
        <Text className="text-center mt-[10px]">
        <Text>  Access Portal Online via  </Text> 
 
         
          <Text className="text-blue-800  underline font-bold" onPress={handlePress}>ITU | CMS-Portal</Text> 
        </Text>
      </Animated.View>
    </View>
  );
};

export default SignIn;
