import { useState } from "react";
import { supabase } from '../services/supabase/supabaseClient.ts'
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/images/background.webp";
import "../styles/Register.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
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
      className="register-overlay"
    >
      <div className="register-content">
        <div className="flex flex-col items-center mb-6 text-center">
          <h1 className="bebas-neue-header text-9xl text-white mb-2 drop-shadow-lg">
            BOOK CRUSH
          </h1>
          <p className="playfair-display-subtitle text-2xl text-white/90 drop-shadow-md mb-4">
            The Tinder for Romance Books
          </p>
        </div>

        <div className="register-card">
          <h2 className="playfair-regular text-3xl text-center mb-8 text-gray-800">
            Join Book Crush
          </h2>
          <form onSubmit={handleSignUp} className="flex flex-col space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              type="email"
              className="register-input w-full"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="register-input w-full"
              required
            />
            {error && (
              <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}
            <div className="mt-8">
              <button type="submit" className="register-button w-full">
                Sign Up
              </button>
            </div>
          </form>
          <p className="playfair-regular mt-6 text-center text-gray-700">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-pink-600 font-semibold hover:text-pink-700 transition-colors"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
