import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "../styles/WantToRead.css";
import { supabase } from "../services/supabase/supabaseClient.ts";
import backgroundImage from "../assets/images/background.webp";

// TODO: Fix want to read css
// TODO: Double check when you get to the end of a list or there are no books in search that things look good
// TODO: Ensure books dont get added to shelf twixe
type Book = {
  id: number;
  title: string;
  author: string; // Add author field
  cover_url: string;
  user_id: string;
  // add other fields if needed
};

const WantToRead = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData?.user)
          throw userError || new Error("User not found");
        const user = userData.user;
        const { data, error } = await supabase
          .from("want_to_read")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        setBooks(data);
      } catch (err) {
        setError("Failed to fetch books. Please try again.");
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (bookId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("want_to_read")
        .delete()
        .eq("id", bookId);

      if (error) throw error;
      setBooks(books.filter((book) => book.id !== bookId));
    } catch (err) {
      setError("Failed to delete the book. Please try again.");
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
      <div className="want-to-read-container">
        {/* Added page title */}
        <h1 className="title-header">Want to Read</h1>

        {error && <p className="error-message">{error}</p>}
        <div className="bookshelf">
          {books.map((book) => (
            <div className="book-card" key={book.id}>
              <img src={book.cover_url} alt={book.title} />
              <div className="book-info">
                <p className="book-title">{book.title}</p>
                <p className="book-author">{book.author}</p>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDelete(book.id)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button className="back-button" onClick={() => navigate("/")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default WantToRead;
