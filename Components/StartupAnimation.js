// StartupAnimation.js
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import logo from "../assets/icon.png";

const StartupAnimation = ({ onAnimationEnd }) => {
  const logoScale = useRef(new Animated.Value(0)).current; 
  const logoTranslateX = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => { 
    Animated.sequence([ 
      Animated.timing(logoScale, {
        toValue: 1.5,
        duration: 900,
        useNativeDriver: true,
      }), 
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0, 
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      // Shrink the logo and move it to the left, slide text out, then fade out the screen
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.3, 
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateX, {
          toValue: -1500,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateX, {
          toValue: 1500,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onAnimationEnd());
  }, []);

  return (
    <Animated.View style={{ opacity: screenOpacity }} className="flex-1 justify-center items-center bg-custom-blue">
      <Animated.Image
        source={logo}
        style={{
          transform: [
            { scale: logoScale },
            { translateX: logoTranslateX },
          ],
        }}
        className="w-24 h-24 mb-5 rounded-full"
      />
      <Animated.Text
        style={{
          opacity: textOpacity,
          transform: [
            { translateY: textTranslateY },
            { translateX: textTranslateX },
          ],
        }}
        className="text-2xl mt-[25px] text-white ml-2 font-bold"
      >
        ITU-Student Portal
      </Animated.Text>
    </Animated.View>
  );
};

export default StartupAnimation;
