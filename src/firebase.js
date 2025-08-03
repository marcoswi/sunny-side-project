import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJ14OQ8TA7uxkRVUOKILV6raT0HWyneCM",
  authDomain: "sunny-side-project.firebaseapp.com",
  projectId: "sunny-side-project",
  storageBucket: "sunny-side-project.firebasestorage.app",
  messagingSenderId: "704625855924",
  appId: "1:704625855924:web:818d8ea24fcecd6ccef6e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

export { app, auth, db }; 
