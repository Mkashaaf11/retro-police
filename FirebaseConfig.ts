// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVZ7BcuKo9GQd6LRaYJMr9wSMmiToeHfA",
  authDomain: "retro-police.firebaseapp.com",
  projectId: "retro-police",
  storageBucket: "retro-police.appspot.com",
  messagingSenderId: "31610083749",
  appId: "1:31610083749:web:54b0d672f13c69e113304c",
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
