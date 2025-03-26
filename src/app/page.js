"use client";

import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// validation schema using Yup
const schema = yup.object().shape({
  username: yup.string().when("isSignUp", {
    is: true,
    then: (schema) => schema.required("Username is required"),
  }),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      isSignUp: false,
    },
  });

  const isSignUp = watch("isSignUp");

  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  }, [user, router]);

  const onSubmit = async (data) => {
    try {
      if (data.isSignUp) {
        const newUser = await registerWithEmail.mutateAsync({ email: data.email, password: data.password, username: data.username });

        await setDoc(doc(db, "users", newUser.uid), {
          displayName: data.username,
          email: newUser.email,
          uid: newUser.uid,
        });
      } else {
        // Login user
        await loginWithEmail.mutateAsync({ email: data.email, password: data.password });
      }

      reset();
    } catch (error) {
      setError("general", { message: error.message || "Something went wrong. Try again!" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h1 className="text-2xl font-semibold mb-4">{isSignUp ? "Sign Up" : "Log In"}</h1>

        {/* General Error Message */}
        {errors.general && <p className="text-red-500 text-sm mb-2">{errors.general.message}</p>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username (Only for Signup) */}
          {isSignUp && (
            <div>
              <input
                type="text"
                placeholder="Username"
                {...register("username")}
                className="w-full p-2 border rounded mb-1"
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            </div>
          )}

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full p-2 border rounded mb-1"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full p-2 border rounded mb-1"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        {/* Google Login */}
        <button
          onClick={() => loginWithGoogle.mutate()}
          className="w-full bg-red-500 text-white p-2 rounded mt-2"
        >
          Sign in with Google
        </button>

        <p
          className="text-sm text-blue-500 cursor-pointer mt-3"
          onClick={() => reset({ isSignUp: !isSignUp })}
        >
          {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
        </p>
      </div>
    </div>
  );
};

export default Login;
