module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // otros plugins (si los hay) arriba...
      'react-native-reanimated/plugin', // SIEMPRE ÚLTIMO
    ],
  };
};
