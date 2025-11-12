import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBN_LNWPJdLNJCnTcLJBCjwFyXhRsqiJfs",
  authDomain: "oasischats.firebaseapp.com",
  projectId: "oasischats",
  storageBucket: "oasischats.firebasestorage.app",
  messagingSenderId: "181005402593",
  appId: "1:181005402593:web:7fb56ac390a8abb89112a0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

