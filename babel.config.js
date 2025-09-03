module.exports = function (api) {
  api.cache(true);
  return {
    sourceType: 'unambiguous',
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', { root: ['./'], alias: { '@': './src' } }],
      'react-native-reanimated/plugin', // SIEMPRE el último
    ],
  };
};
