/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { ProfileData, useFirestore } from "@/modules/profilePage";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import DonutChart from "../components/DonutChart";
import PagesChart from "../components/PagesChart";
import RatingPieChart from "../components/RatingsChart";

const ChallengeScreen: React.FC = () => {
  const { getProfileData, getReadBooksThisYear } = useFirestore();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [readBooks, setReadBooks] = useState([]);
  const [pagesRead, setPagesRead] = useState<number>(0);

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
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;
    const fetchedReadBooks = await getReadBooksThisYear(userId);
    setReadBooks(fetchedReadBooks);

    const totalPages = fetchedReadBooks.reduce(
      (
        total: any,
        book: {
          pagesTotal: any;
        }
      ) => {
        return total + (book.pagesTotal || 0); // Ako nema pageCount, dodaj 0
      },
      0
    );
    setPagesRead(totalPages);

    const data = await getProfileData(userId);
    if (data) {
      setProfileData(data);
    }
  };

  return (
    <div className="min-h-screen bg-brown-700 text-brown-100">
      <NavBar></NavBar>
      {/* Reading Challenge */}
      <div className="flex flex-col items-center w-full">
        <div className="bg-orange-300 w-full">
          <div className="flex py-5 gap-10 items-center w-full justify-center">
            <img src="book.png" alt="Open book" className="w-40 h-auto" />
            <p className="text-brown-100 font-extrabold tracking-tighter text-5xl">
              Reading <br></br> Challenge
            </p>
          </div>
        </div>
        <div className="bg-orange-700 w-full h-16 flex items-center flex-col"></div>
      </div>
      <div className="flex my-8">
        <DonutChart
          booksRead={readBooks.length}
          readingGoal={profileData.booksToRead ?? 0}
        />
        <PagesChart pagesRead={pagesRead} />
        <RatingPieChart readBooks={readBooks} />
      </div>
      <p className="text-center my-28 text-5xl font-bold">Your books</p>
      <div className="flex flex-wrap gap-14 items-center justify-center px-32">
        {readBooks.map((book: any, index: number) => (
          <div key={index} className="flex flex-col items-center">
            {book.image ? (
              <a href={`/googleBooks/${book.id}`}>
                <img
                  src={book.image}
                  alt={book.title || "Cover"}
                  className="w-48 h-72 object-cover shadow-3xl"
                />
              </a>
            ) : (
              <div className="w-32 h-48 items-center flex justify-center bg-gray-300 text-gray-700 rounded-lg shadow-lg">
                No Cover
              </div>
            )}
            <div className="flex space-x-px mt-7">
              {Array.from({ length: 5 }, (_, index) => (
                <img
                  key={index}
                  src={`/stars${index < book.rating ? index + 1 : 0}.png`}
                  alt={`${index + 1} star`}
                  className="w-9 h-9"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-36 pb-32 mt-28">
        <div>
          <p className="text-center my-16 text-4xl font-bold">
            Your longest book
          </p>
          <div>
            {(() => {
              const bookWithMostPages = readBooks.reduce(
                (maxBook: any, book: any) => {
                  return book.pagesTotal > (maxBook?.pagesTotal || 0)
                    ? book
                    : maxBook;
                },
                null
              );

              return bookWithMostPages ? (
                <div className="flex items-center justify-center gap-14">
                  {bookWithMostPages.image ? (
                    <img
                      src={bookWithMostPages.image}
                      alt={bookWithMostPages.title || "Cover"}
                      className="w-48 h-64 object-cover shadow-3xl"
                    />
                  ) : (
                    <div className="w-32 h-48 flex items-center justify-center bg-gray-300 text-gray-700 rounded-lg shadow-lg">
                      No Cover
                    </div>
                  )}
                  <p className="text-3xl">
                    {bookWithMostPages.pagesTotal} pages
                  </p>
                </div>
              ) : (
                <p className="text-center text-gray-500">No books available</p>
              );
            })()}
          </div>
        </div>

        <p className="text-5xl font-bold mt-44">VS</p>

        <div>
          <p className="text-center my-16 text-4xl font-bold">
            Your shortest book
          </p>
          <div>
            {(() => {
              const bookWithLeastPages = readBooks.reduce(
                (minBook: any, book: any) => {
                  return book.pagesTotal < (minBook?.pagesTotal || Infinity)
                    ? book
                    : minBook;
                },
                null
              );
              return bookWithLeastPages ? (
                <div className="flex items-center justify-center gap-14">
                  {bookWithLeastPages.image ? (
                    <img
                      src={bookWithLeastPages.image}
                      alt={bookWithLeastPages.title || "Cover"}
                      className="w-48 h-64 object-cover shadow-3xl"
                    />
                  ) : (
                    <div className="w-32 h-48 flex items-center justify-center bg-gray-300 text-gray-700 rounded-lg shadow-lg">
                      No Cover
                    </div>
                  )}
                  <p className="text-3xl">
                    {bookWithLeastPages.pagesTotal} pages
                  </p>
                </div>
              ) : (
                <p className="text-center text-gray-500">No books available</p>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeScreen;
