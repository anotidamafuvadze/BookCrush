import { useState } from "react";
import { supabase } from '../services/supabase/supabaseClient.ts'
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/images/background.webp";
import "../styles/Login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else navigate("/");
  }

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
      }}
      className="login-overlay"
    >
      <div className="login-content">
          <h1 className="login-header ">
            BOOK CRUSH
          </h1>
          <p className="playfair-display-subtitle">
            The Tinder for Romance Books
          </p>

        <div className="login-card">
          <h2 className="playfair-regular text-3xl text-center mb-8 text-gray-800">
            Welcome Back
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              type="email"
              className="login-input w-full"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="login-input w-full"
              required
            />
            {error && (
              <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}
            <div className="mt-8">
              <button type="submit" className="login-button w-full">
                Log In
              </button>
            </div>
          </form>
          <p className="playfair-regular mt-6 text-center text-gray-700">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-pink-600 font-semibold hover:text-pink-700 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
