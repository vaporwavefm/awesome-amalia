// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsW2kFyanfPyDkHwxklCeTnDxoYtmWBRY",
  authDomain: "rpdrsim.firebaseapp.com",
  projectId: "rpdrsim",
  storageBucket: "rpdrsim.firebasestorage.app",
  messagingSenderId: "1081769719990",
  appId: "1:1081769719990:web:2b8c42f5e018f8b9c94e17",
  measurementId: "G-4PS586BVYX"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };