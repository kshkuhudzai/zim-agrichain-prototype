// frontend/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration (from Firebase Console)
// Replace these with your actual config object
const firebaseConfig = {
  apiKey: "AIzaSyCIFOLieaqUUNMQh6gV9YSEk8fKmba_51A",
  authDomain: "zim-agrichain-proto.firebaseapp.com",
  projectId: "zim-agrichain-proto",
  storageBucket: "zim-agrichain-proto.firebasestorage.app",
  messagingSenderId: "908537134533",
  appId: "1:908537134533:web:149527a26155a71f601fac"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);