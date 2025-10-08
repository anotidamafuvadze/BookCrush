import React, { useState } from "react";
import "../styles/DashBoard.css";
import { getBooks } from "../services/api/booksAPI.ts";
import { tropeCategories } from "../lib/tropes.ts";
import backgroundImage from "../assets/images/background.jpg";

function DashBoard() {
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
      console.log("Books Returned:", books); // Debugging log
    } catch (error) {
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
      <div className="dashboard-content">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="dashboard-header">
            <h1 className="bebas-neue-header text-3xl text-white drop-shadow-lg dashboard-title">
              BOOK CRUSH
            </h1>
            <div className="dashboard-header-buttons">
              <button className="dashboard-button">Want to Read</button>
              <button className="dashboard-button">Logout</button>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2 className="playfair-regular text-5xl text-center mb-8 text-gray-800">
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
                className="dashboard-input dashboard-select w-full"
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
                className="dashboard-input dashboard-select w-full"
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
            <button type="submit" className="dashboard-button w-full">
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
