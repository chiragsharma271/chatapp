'use client';

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

    if (isSignUp) {
      if (!username.trim()) {
        setError("Username is required for signup.");
        return;
      }

      try {
        const newUser = await registerWithEmail.mutateAsync({ email, password, username });

        // ✅ Store username in Firestore under 'users' collection
        await setDoc(doc(db, "users", newUser.uid), {
          displayName: username,
          email: newUser.email,
          uid: newUser.uid,
        });

        setEmail("");
        setPassword("");
        setUsername("");
      } catch (error) {
        console.error("Signup failed:", error);
        setError("Signup failed! Try again.");
      }
    } else {
      try {
        await loginWithEmail.mutateAsync({ email, password });
      } catch (error) {
        console.error("Login failed:", error);
        setError("Invalid credentials! Try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h1 className="text-2xl font-semibold mb-4">{isSignUp ? "Sign Up" : "Log In"}</h1>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {isSignUp && (
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded mb-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSubmit} className="w-full bg-blue-500 text-white p-2 rounded">
          {isSignUp ? "Sign Up" : "Log In"}
        </button>

        <button
          onClick={() => loginWithGoogle.mutate()}
          className="w-full bg-red-500 text-white p-2 rounded mt-2"
        >
          Sign in with Google
        </button>

        <p
          className="text-sm text-blue-500 cursor-pointer mt-3"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
        >
          {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
        </p>
      </div>
    </div>
  );
};

export default Login;
