import { useState } from "react";
import { supabase } from "../services/supabase/supabaseClient.ts";
import { useNavigate, Link } from "react-router-dom";
import backgroundImage from "../assets/images/background.webp";
import "../styles/Register.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { name, email, password } = formData;

    try {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        console.error("SignUp Error:", signUpError);

        // Handle specific error messages
        if (signUpError.message.includes("duplicate key value")) {
          setError(
            "This email is already registered. Please use a different email."
          );
        } else if (signUpError.message.includes("password")) {
          setError("Password is too weak. Please use at least 6 characters.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
        console.log("signup error:", signUpError.message);
        return;
      }

      const user = signUpData.user;
      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ id: user.id, name }]);

        if (profileError) {
          console.error("Profile Insert Error:", profileError);
          setError("Failed to save user profile. Please try again.");
          return;
        }

        navigate("/");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError("Failed to register. Please try again.");
    }
  };

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
          <h1 className="register-header text-9xl text-white mb-2 drop-shadow-lg">
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
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="register-input w-full"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="register-input w-full"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
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
