"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth, provider } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Import Firestore instance
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerWithEmail = useMutation({
    mutationFn: async ({ email, password, username }) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // ✅ Set displayName in Firebase Auth
      await updateProfile(user, { displayName: username });
  
      // ✅ Store user in Firestore under "users" collection
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: username,
        createdAt: new Date(),
      });
  
      return { ...user, displayName: username };
    },
  });

  const loginWithEmail = useMutation({
    mutationFn: async ({ email, password }) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(["user"], user);
      router.push("/chat");
    },
  });

  const loginWithGoogle = useMutation({
    mutationFn: async () => {
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(["user"], user);
      router.push("/chat");
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await signOut(auth);
      setUser(null);
      queryClient.removeQueries(["user"]);
    },
  });

  return (
    <AuthContext.Provider value={{ user, loading, registerWithEmail, loginWithEmail, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
