import 'dotenv/config';
import { ExpoConfig } from '@expo/config';

const pkg = 'com.gonzaloirc.pergaminoapp';

const config: ExpoConfig = {
  name: 'Pergamino App',
  slug: 'pergamino-app',
  scheme: 'pergamino',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '0.1.0',
  extra: {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    EXPO_PUBLIC_USE_EMULATORS: process.env.EXPO_PUBLIC_USE_EMULATORS || '0',
    EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost',
    EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099',
    EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost',
    EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT: process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080',
    EXPO_PUBLIC_QR_TTL_SECONDS: process.env.EXPO_PUBLIC_QR_TTL_SECONDS || '30',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: pkg,
  },
  android: {
    package: pkg,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.INTERNET',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.VIBRATE',
      'android.permission.WAKE_LOCK',
    ],
  },
};

export default config;
