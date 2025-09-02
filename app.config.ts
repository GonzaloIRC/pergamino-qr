const config = {
  name: 'Pergamino App',
  slug: 'pergamino-app',
  version: '1.0.0',
  sdkVersion: '53.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  backgroundColor: '#8B4513',
  splash: {
    backgroundColor: '#8B4513',
    resizeMode: 'contain',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.gonzaloirc.pergaminoapp',
    backgroundColor: '#8B4513',
  },
  web: {
    bundler: 'metro',
  },
  extra: {
    eas: {
      projectId: 'fbf2a674-89ee-45f3-a899-6c4eccceeee7',
    },
    EXPO_PUBLIC_USE_EMULATORS: process.env.EXPO_PUBLIC_USE_EMULATORS ?? 'false',
    EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
    EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT,
    EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST,
    EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT,
  },
  plugins: [
    'expo-font'
  ],
};
export default config;
