// filepath: app.config.ts
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'PergaminoApp',
  slug: 'pergamino-app',
  version: '1.0.0',
  scheme: 'pergamino',
  owner: undefined,
  extra: {
    // Firebase (usamos .env.local con EXPO_PUBLIC_*)
    EXPO_PUBLIC_USE_EMULATORS: process.env.EXPO_PUBLIC_USE_EMULATORS ?? 'false',
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_FIREBASE_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_BUCKET,
    // Emuladores
    EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1',
    EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT ?? '9099',
    EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST ?? '127.0.0.1',
    EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT ?? '8080',
  },
  ios: {
    bundleIdentifier: 'com.gonzaloirc.pergaminoapp',
  },
  android: {
    package: 'com.gonzaloirc.pergaminoapp',
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    permissions: [
      'CAMERA',
      'INTERNET',
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'POST_NOTIFICATIONS',
      'VIBRATE',
      'WAKE_LOCK',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        data: [{ scheme: 'pergamino', host: '*' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    bundler: 'metro',
  },
};

export default config;
