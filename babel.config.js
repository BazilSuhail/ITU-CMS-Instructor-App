module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // Uncomment if you use react-native-reanimated
      'react-native-reanimated/plugin'
    ],
  };
};
