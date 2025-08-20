import { useState } from "react";
import { supabase } from "@/lib/suppabaseClient";
import { useLocation } from "wouter";
import authBg from "@/assets/Jobinterview.mp4";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // toggle mode
  const [, setLocation] = useLocation(); // ✅ for redirecting

  // Email/Password Authentication
  async function handleAuth() {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "http://localhost:5173/dashboard", // after confirming email
        },
      });
      if (error) {
        console.error("Signup error:", error);
        alert(error.message);
      } else {
        alert("Check your email to confirm signup!");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Login error:", error);
        alert(error.message);
      } else {
        console.log("Login success:", data);
        setLocation("/dashboard"); // ✅ Redirect to dashboard
      }
    }
  }

  // Google Authentication
  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:5173/dashboard", // after Google login
      },
    });
    if (error) alert(error.message);
  }

  return (
    <div className="flex h-screen">
      {/* Left side with image */}
      <div className="hidden md:flex w-1/2 relative">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={authBg} // ✅ import or use "/auth-bg.mp4" if in public
          autoPlay
          loop
          muted
          playsInline
        ></video>

        {/* Optional dark overlay for text readability
        <div className="absolute inset-0 bg-black/40"></div> */}
      </div>

      {/* Right side with form */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            {isSignUp ? "Create Account ✨" : "Welcome Back 👋"}
          </h2>
          <p className="text-center text-gray-500">
            {isSignUp
              ? "Sign up to get started with InterviewCoach"
              : "Login to continue to InterviewCoach"}
          </p>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Sign In / Sign Up button */}
          <button
            onClick={handleAuth}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <div className="flex items-center gap-2">
            <hr className="flex-grow border-gray-300" />
            <span className="text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
          >
            {isSignUp ? "Sign up with Google" : "Sign in with Google"}
          </button>

          {/* Switch link */}
          <p className="text-center text-gray-600 text-sm mt-4">
            {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:underline font-medium"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
