import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCeQU3rKV1DkNwkyF5mFqDp9NYDMPAfOt4",
  authDomain: "codigos-pergamino.firebaseapp.com",
  projectId: "codigos-pergamino",
  storageBucket: "codigos-pergamino.appspot.com",
  messagingSenderId: "849867276398",
  appId: "1:849867276398:web:0d9273b3c5130447f3a67f",
  measurementId: "G-GT982TM94R"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);