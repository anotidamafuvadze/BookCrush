import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TinderCard from "react-tinder-card";
import { supabase } from "../services/supabase/supabaseClient.ts";
import "../styles/Swiping.css";
import backgroundImage from "../assets/images/background.webp";

type Book = {
  id: React.Key | null | undefined;
  cover_url?: string;
  title?: string | null;
  author?: string | null;
  pages?: string | null;
  rating?: string | null;
  number_of_ratings?: string | null;
  synopsis?: string | null;
  tropes?: string | null;
  subgenre?: string | null;
  spice_level?: string | null;
  year?: string | null;
};

const FALLBACK_COVER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='900'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <text x='50%' y='50%' text-anchor='middle' font-size='28' fill='#9ca3af' font-family='sans-serif'>No Cover</text>
    </svg>`
  );

function Swiping() {
  const location = useLocation();
  const navigate = useNavigate();
  const { books, message } = location.state || { books: [], message: null };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const safeCover = (url?: string) =>
    url && url.startsWith("http") ? url : undefined;

  const handleSwipe = async (direction: string, book: Book) => {
    if (direction !== "right") return;

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("User not logged in.");
        return;
      }

      // Build row with valid columns only (no spreading)
      const newEntry = {
        user_id: user.id,
        id: Number(book.id), // matches bigint in books
        title: book.title ?? "",
        author: book.author ?? "",
        pages: book.pages ? Number(book.pages) : null,
        year: book.year ? Number(book.year) : null,
        synopsis: book.synopsis ?? null,
        tropes: book.tropes ?? null,
        subgenre: book.subgenre ?? null,
        rating: book.rating ? Number(book.rating) : null,
        ratings_count: book.number_of_ratings
          ? Number(book.number_of_ratings)
          : null,
        cover_url: book.cover_url ?? null,
      };

      // Insert — prevent duplicates with unique (user_id, book_id)
      const { error } = await supabase.from("want_to_read").insert(newEntry);

      if (error) throw error;
      console.log(`✅ Added "${book.title}" to Want to Read`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error adding book to Want to Read shelf.");
    }
  };

  const handleCardLeftScreen = (bookId: React.Key | null | undefined) => {
    setCurrentIndex((prev) => prev + 1); // Update the current index
  };

  if (message || books.length === 0) {
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
        className="swiping-overlay"
      >
        <div className="no-books-message">
          <h2>No books found. Please try again.</h2>
          <button
            className="swipe-button"
            onClick={() => navigate("/")}
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
      className="swiping-overlay"
    >
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>
      )}

      {/* Top buttons */}
      <div className="top-buttons">
        <button className="swipe-button" onClick={() => navigate("/")}>
          Dashboard
        </button>
        <button
          className="swipe-button"
          onClick={() => navigate("/want-to-read")}
        >
          Want to Read Shelf
        </button>
      </div>

      <div className="relative flex items-center justify-center min-h-[60vh] p-2">
        {currentIndex >= books.length ? (
          // End of list message
          <div className="end-of-list-message">
            <h2>You've reached the end of the list!</h2>
          </div>
        ) : (
          // Render the current book
          books.slice(currentIndex, currentIndex + 1).map((book: Book) => {
            const coverUrl = safeCover(book.cover_url) ?? FALLBACK_COVER;

            return (
              <div className="swiping-card-container" key={String(book.id)}>
                <TinderCard
                  onSwipe={(dir) => handleSwipe(dir, book)}
                  onCardLeftScreen={() => handleCardLeftScreen(book.id)}
                  preventSwipe={["up", "down"]}
                  swipeRequirementType="position" // Use position-based swipe detection
                  swipeThreshold={50} // Reduce the swipe threshold to make the swipe faster
                >
                  <div className="swiping-card pointer-events-auto">
                    <img
                      src={coverUrl}
                      alt={book.title ?? "Book cover"}
                      className="hidden"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          FALLBACK_COVER;
                      }}
                    />
                    <div className="swiping-card-content">
                      <h2 className="swiping-card-title">{book.title}</h2>
                      <p className="swiping-card-author">{book.author}</p>
                      {book.pages && (
                        <p className="swiping-card-details">
                          {book.pages} pages
                        </p>
                      )}
                      {(book.rating || book.number_of_ratings) && (
                        <p className="swiping-card-details">
                          Rating: {book.rating ?? "—"} (
                          {book.number_of_ratings ?? "0"} ratings)
                        </p>
                      )}
                      {book.synopsis && (
                        <p className="swiping-card-synopsis">
                          {book.synopsis}...
                        </p>
                      )}
                      {book.tropes && (
                        <p className="swiping-card-details">
                          Tropes: {book.tropes}
                        </p>
                      )}
                      {book.subgenre && (
                        <p className="swiping-card-details">
                          Subgenre: {book.subgenre}
                        </p>
                      )}
                      {book.spice_level && (
                        <p className="swiping-card-details">
                          Spice Level: {book.spice_level}
                        </p>
                      )}
                    </div>
                  </div>
                </TinderCard>
              </div>
            );
          })
        )}
      </div>

      <p className="swiping-card-message select-none pointer-events-none">
        Swipe right to add to "Want to Read" shelf. Swipe left to reject.
      </p>
    </div>
  );
}

export default Swiping;
