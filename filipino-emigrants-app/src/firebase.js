// src/firebase.js

// Use the 'compat' libraries for better stability and to avoid common errors
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLUdh19CXmn5lsYv2eLBRhH8Rf-KMBSJQ",
  authDomain: "casestudy2-65068.firebaseapp.com",
  projectId: "casestudy2-65068",
  storageBucket: "casestudy2-65068.appspot.com", // Usually ends in .appspot.com
  messagingSenderId: "103417539317",
  appId: "1:103417539317:web:bcc07e085448a083ee73bc",
  measurementId: "G-R4LD2TRL4N"
};

// This check prevents Firebase from being initialized multiple times
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize and prepare the services for export
const auth = firebase.auth();
const db = firebase.firestore();

// Export both auth and db so your other files can use them
export { auth, db };