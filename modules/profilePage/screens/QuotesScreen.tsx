/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useFirestore } from "../hooks/useFirestore";

const QuotesScreen: React.FC = () => {
  const { getQuotes } = useFirestore();
  const [userId, setUserId] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<{ bookTitle: string; quote: string }[]>(
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchQuotes();
    }
  }, [userId]);

  const fetchQuotes = async () => {
    if (!userId) return;
    const fetchedQuotes = await getQuotes(userId);
    setQuotes(fetchedQuotes);
  };
  return (
    <div className="min-h-screen bg-brown-700 text-brown-100">
      <NavBar />
      <div className="flex flex-col items-center w-full mb-10">
        <div className="bg-orange-300 w-full">
          <div className="flex py-5 gap-10 items-center w-full justify-center">
            <img src="book.png" alt="Open book" className="w-40 h-auto" />
            <p className="text-brown-100 font-extrabold tracking-tighter text-5xl">
              Your Favorite<br></br> Quotes
            </p>
          </div>
        </div>
      </div>
      <div className="px-72 py-5">
        {quotes.length > 0 ? (
          <ul className="space-y-5">
            {quotes.map((quote, index) => (
              <li
                key={index}
                className="p-5 bg-orange-700 text-brown-800 rounded-lg shadow-md"
              >
                <p className="italic text-xl">"{quote.quote}"</p>
                <p className="mt-2 text-right mr-10 text-lg font-semibold">
                  - {quote.bookTitle}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-lg">
            You havent added any quotes yet.
          </p>
        )}
      </div>
    </div>
  );
};
export default QuotesScreen;
