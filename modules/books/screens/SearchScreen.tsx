/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "@/components/NavBar";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import React from "react";
import ShelfButtons from "@/modules/books/components/ShelfButtons";
import useShelfFunctions from "@/modules/books/hooks/useShelfFunctions";
import Footer from "@/components/Footer";

const SearchPage = () => {
  const { fetchUserShelves } = useShelfFunctions();
  const router = useRouter();
  const { searchType, searchTerm } = router.query;
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserShelves(user.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!searchTerm || !user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/books", {
          params: {
            searchType,
            searchTerm,
          },
        });
        setBooks(response.data.items || []);
      } catch (error) {
        setError("Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchType, searchTerm, user]);

  return (
    <div className="flex flex-col min-h-screen bg-brown-700">
      <NavBar />
      <h1 className="text-2xl my-10 text-center text-brown-100">
        {searchTerm ? `Search Results for "${searchTerm}"` : "Search Books"}
      </h1>
      <div className="flex flex-col items-center px-32 mb-20 min-h-screen">
        {loading ? (
          <p className="text-brown-200">Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="flex flex-col w-fit gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="grid grid-cols-6 gap-4 place-items-start px-16 py-8 bg-orange-600"
              >
                <a href={`/googleBooks/${book.id}`} className="flex-shrink-0">
                  <img
                    src={book.volumeInfo.imageLinks?.thumbnail}
                    alt={book.volumeInfo.title}
                    className="w-36 h-52 mr-4"
                  />
                </a>
                <div className="col-span-4 flex flex-col justify-between h-full">
                  <a href={`/googleBooks/${book.id}`}>
                    <h2 className="text-xl font-bold text-brown-100">
                      {book.volumeInfo.title}
                    </h2>
                    <p className="text-brown-200 text-lg">
                      by{" "}
                      {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                    </p>
                    <p className="text-brown-300">
                      Published: {book.volumeInfo.publishedDate || "N/A"}
                    </p>
                  </a>
                  <p className="text-brown-200 text-lg mb-4">
                    {book.volumeInfo.description?.slice(0, 100)}...{" "}
                    <a
                      href={`/googleBooks/${book.id}`}
                      className="text-brown-300 hover:text-brown-100"
                    >
                      Find out more
                    </a>
                  </p>
                </div>
                <ShelfButtons book={book} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer></Footer>
    </div>
  );
};

export default SearchPage;
