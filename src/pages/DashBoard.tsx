import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase/supabaseClient.ts";
import "../styles/DashBoard.css";
import { getBooks } from "../services/api/booksAPI.ts";
import { tropeCategories } from "../lib/tropes.ts";
import backgroundImage from "../assets/images/background.webp";
import AutoplayCarousel from "../components/AutoplayCarousel.tsx"; // Import the carousel component

function DashBoard() {
  const [userName, setUserName] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    tropes: [] as string[],
    subgenre: "",
    minRating: "",
    maxRating: "",
    minPages: "",
    maxPages: "",
    spiceLevel: "",
  });

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // State for error handling
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    let mounted = true;

    async function load() {
      // 1) make sure we actually have a session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        console.error(sessionError);
        if (mounted) setError("Failed to get session.");
        return;
      }
      const user = session?.user;
      if (!user) {
        if (mounted) setUserName(null); // not logged in
        return;
      }

      // 2) read profile (use maybeSingle to avoid throwing on 0 rows)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(profileError);
        if (mounted) setError("Failed to fetch user information.");
        return;
      }

      if (mounted)
        setUserName(profile?.name ?? user.email?.split("@")[0] ?? "User");
    }

    load();

    // 3) keep it in sync if auth state changes (login/logout/refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!sess?.user) {
        setUserName(null);
        return;
      }
      supabase
        .from("profiles")
        .select("name")
        .eq("id", sess.user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            setUserName("User");
          } else {
            setUserName(data?.name ?? sess.user.email?.split("@")[0] ?? "User");
          }
        });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleTropeChange = (trope: string) => {
    setFilters((prev) => {
      const newTropes = prev.tropes.includes(trope)
        ? prev.tropes.filter((t) => t !== trope)
        : [...prev.tropes, trope];
      return { ...prev, tropes: newTropes };
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error state
    const {
      title,
      author,
      tropes,
      subgenre,
      minRating,
      maxRating,
      minPages,
      maxPages,
      spiceLevel,
    } = filters;

    const options = {
      titleIlike: title || undefined,
      authorIlike: author || undefined,
      tropesAny: tropes.length > 0 ? tropes : undefined,
      subgenreIlike: subgenre || undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxRating: maxRating ? parseFloat(maxRating) : undefined,
      minPages: minPages ? parseInt(minPages, 10) : undefined,
      maxPages: maxPages ? parseInt(maxPages, 10) : undefined,
      spiceEq: spiceLevel
        ? (spiceLevel as import("../services/api/booksAPI").Spice)
        : undefined,
    };

    console.log("Query Options:", options); // Debugging log

    try {
      const books = await getBooks(options);
      if (books.length === 0) {
        navigate("/swiping", {
          state: { books: [], message: "No books found. Please try again." },
        });
      } else {
        navigate("/swiping", { state: { books } });
      }
    } catch (error) {
      setError("Error fetching books. Please try again later.");
      console.error("Error fetching books:", error);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100%",
      }}
      className="dashboard-overlay"
    >
      <div className="dashboard-layout">
        {/* Left carousel */}
        <div className="carousel-left">
          <AutoplayCarousel />
        </div>

        {/* Dashboard content */}
        <div className="dashboard-content">
          {error && (
            <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">
              {error}
            </div>
          )}
          <div className="">
            <div className="dashboard-header">
              <div>
                <h1>BOOK CRUSH</h1>
                <p className="user-greeting">Hi {userName || "User"}!</p>{" "}
              </div>
              
              <div className="dashboard-header-buttons">
                <button
                  className="dashboard-button"
                  onClick={() => navigate("/want-to-read")}
                >
                  Want to Read
                </button>
                <button
                  className="dashboard-button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h2 className="header text-6xl text-center mb-8 text-gray-800">
              Filter Your Books
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={filters.title}
                onChange={handleChange}
                className="dashboard-input w-full placeholder-black"
              />
              <input
                type="text"
                name="author"
                placeholder="Author"
                value={filters.author}
                onChange={handleChange}
                className="dashboard-input w-full placeholder-black"
              />
              <select
                name="subgenre"
                value={filters.subgenre}
                onChange={handleChange}
                className="dashboard-input dashboard-select w-full"
              >
                <option value="">Select Subgenre</option>
                <option value="Contemporary">Contemporary</option>
                <option value="Dark Romance">Dark Romance</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Gothic">Gothic</option>
                <option value="Historical">Historical</option>
                <option value="New Adult">New Adult</option>
                <option value="Paranormal">Paranormal</option>
                <option value="Regency">Regency</option>
                <option value="Rom-Com">Rom-Com</option>
                <option value="Romantic Suspense">Romantic Suspense</option>
                <option value="Small Town">Small Town</option>
                <option value="Sports Romance">Sports Romance</option>
                <option value="Young Adult">Young Adult</option>
              </select>
              <div className="flex space-x-4">
                <input
                  type="number"
                  name="minPages"
                  placeholder="Min Pages"
                  value={filters.minPages}
                  onChange={handleChange}
                  min="0"
                  className="dashboard-input w-full placeholder-black"
                />
                <input
                  type="number"
                  name="maxPages"
                  placeholder="Max Pages"
                  value={filters.maxPages}
                  onChange={handleChange}
                  min="0"
                  className="dashboard-input w-full placeholder-black"
                />
              </div>
              <div className="flex space-x-4">
                <select
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleChange}
                  className="dashboard-input dashboard-select rating w-full"
                >
                  <option value="">Min Rating</option>
                  <option value="1.0">1.0</option>
                  <option value="2.0">2.0</option>
                  <option value="3.0">3.0</option>
                  <option value="4.0">4.0</option>
                </select>
                <select
                  name="maxRating"
                  value={filters.maxRating}
                  onChange={handleChange}
                  className="dashboard-input dashboard-select rating w-full"
                >
                  <option value="">Max Rating</option>
                  <option value="1.0">1.0</option>
                  <option value="2.0">2.0</option>
                  <option value="3.0">3.0</option>
                  <option value="4.0">4.0</option>
                </select>
              </div>
              <select
                name="spiceLevel"
                value={filters.spiceLevel}
                onChange={handleChange}
                className="dashboard-input dashboard-select w-full"
              >
                <option value="">Select Spice Level</option>
                <option value="closed door">Closed Door</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="explicit">Explicit</option>
              </select>
              <div className="trope-categories">
                {Object.entries(tropeCategories).map(([category, tropes]) => (
                  <div key={category} className="trope-category">
                    <button
                      type="button"
                      className="trope-category-header"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </button>
                    {expandedCategory === category && (
                      <div className="trope-options">
                        {tropes.map((trope) => (
                          <label key={trope} className="trope-option">
                            <input
                              type="checkbox"
                              checked={filters.tropes.includes(trope)}
                              onChange={() => handleTropeChange(trope)}
                              className="dashboard-checkbox"
                            />
                            <span>{trope}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="dashboard-button w-full search-button"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Right carousel */}
        <div className="carousel-right">
          <AutoplayCarousel />
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
