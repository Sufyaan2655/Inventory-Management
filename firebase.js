// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7Bb9hhpFFH-X5Tzl5omRju_fje9VH9XM",
  authDomain: "pantry-project-51f45.firebaseapp.com",
  projectId: "pantry-project-51f45",
  storageBucket: "pantry-project-51f45.appspot.com",
  messagingSenderId: "306349681097",
  appId: "1:306349681097:web:fda2d8f322abd482f4e018",
  measurementId: "G-9EQ5ZWRYT2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { app, firestore };
