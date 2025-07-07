
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2VWSLkzTe2dSkq1QzLB7-MbmZdTWW97k",
  authDomain: "brokemate-2e0b7.firebaseapp.com",
  projectId: "brokemate-2e0b7",
  storageBucket: "brokemate-2e0b7.firebasestorage.app",
  messagingSenderId: "218818072529",
  appId: "1:218818072529:web:6e0b69c49a4bc76a4c9af0",
  measurementId: "G-3N3Y9F1VNJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

export default app;