"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth, provider } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

        if (userDoc.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userDoc.data().displayName || "Anonymous", 
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "Anonymous",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerWithEmail = useMutation({
    mutationFn: async ({ email, password, username }) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: username,
        createdAt: new Date(),
      });

      return { ...user, displayName: username };
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(["user"], user);
    },
  });

  const loginWithEmail = useMutation({
    mutationFn: async ({ email, password }) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Fetch username from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const displayName = userDoc.exists() ? userDoc.data().displayName : user.displayName || "Anonymous";

      return { ...user, displayName };
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
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "Anonymous",
          createdAt: new Date(),
        });
      }

      return { ...user, displayName: user.displayName || "Anonymous" };
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
