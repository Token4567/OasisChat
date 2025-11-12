import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    console.log("Sign-in started");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Signed in:", user.displayName);

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL || '',
        bio: 'Hey! I\'m using OasisChat.',
        online: true
      }, { merge: true });

      console.log("User saved to Firestore");
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Sign-in failed:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getUsers = (callback) => {
    if (!currentUser) {
      console.log("getUsers: No currentUser");
      callback([]);
      return () => {};
    }

    console.log("getUsers: Querying for UID:", currentUser.uid);

    const q = query(
      collection(db, 'users'),
      where('uid', '!=', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data };
      });
      console.log("getUsers: Found", users.length, "users:", users.map(u => u.displayName || "No name"));
      callback(users);
    }, (error) => {
      console.error("getUsers error:", error);
      callback([]);
    });

    return unsubscribe;
  };

  useEffect(() => {
    console.log("Auth state listener started");
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user ? user.displayName : "none");
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signInWithGoogle,
    logout,
    getUsers,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
