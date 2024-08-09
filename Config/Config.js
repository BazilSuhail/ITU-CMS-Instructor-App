import firebase from 'firebase/compat/app';
import { useEffect, useState } from "react";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
 
const firebaseConfig = {
  apiKey: "AIzaSyDRP96EEIvRwEzrQeK8tXIVWAySxKM9338",
  authDomain: "cms-itu.firebaseapp.com",
  projectId: "cms-itu",
  storageBucket: "cms-itu.appspot.com",
  messagingSenderId: "112672700741",
  appId: "1:112672700741:web:0c11082bcb3f198695a62c",
  measurementId: "G-T4R52J7F6W"
};
  
// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const auth = firebase.auth();
const fs = firebase.firestore();
const st = firebase.storage();
const FieldValue = firebase.firestore.FieldValue;


const useFirebaseAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { currentUser, loading };
};
export { auth, fs, st, FieldValue, useFirebaseAuth }