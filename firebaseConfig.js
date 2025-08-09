// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCd105qRUoyNFTpJ4aSDS6CeF8-DweltZY",
  authDomain: "projectbrokemate.firebaseapp.com",
  projectId: "projectbrokemate",
  storageBucket: "projectbrokemate.firebasestorage.app",
  messagingSenderId: "132964581710",
  appId: "1:132964581710:web:c71e24742d2b73224cde1f",
  measurementId: "G-1K1C5KLGB2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

export default app;