//EXE THIS -->
//npm install firebase
//npm install bcrypt
//npm install @types/bcrypt --save-dev

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBz0_OL3amYQlXGMjYkSgT5KNLPQRFVXG4",
  authDomain: "lawyerapp-aa1ae.firebaseapp.com",
  projectId: "lawyerapp-aa1ae",
  storageBucket: "lawyerapp-aa1ae.appspot.com",
  messagingSenderId: "97889853694",
  appId: "1:97889853694:web:f589cbf46c321e721205af",
  measurementId: "G-GQ14NM7PVS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, analytics, storage, db };
