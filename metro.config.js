const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver = {
  ...config.resolver,
  // Fuerza a elegir "react-native" antes que "browser"/"main" (clave para Firebase)
  resolverMainFields: ['react-native', 'browser', 'main'],
};
module.exports = config;
