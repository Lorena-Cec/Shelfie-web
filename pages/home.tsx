/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import NavBar from "@/components/NavBar";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { Navigation } from "swiper/modules";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Footer from "@/components/Footer";

interface Book {
  primary_isbn13: string;
  title: string;
  author: string;
  rank?: number;
  book_image?: string;
  description?: string;
}

interface BookList {
  listType: string;
  books: Book[];
}

const Home: React.FC = () => {
  const [booksByList, setBooksByList] = useState<BookList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const listTypes = [
    "combined-print-and-e-book-fiction",
    "trade-fiction-paperback",
  ];

  const listTitleMap: { [key: string]: string } = {
    "combined-print-and-e-book-fiction": "Current Book Ranking",
    "trade-fiction-paperback": "Readers Choice",
  };

  const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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
    const fetchBooksByType = async (listType: string) => {
      try {
        const response = await axios.get(`/api/nytBooks?listType=${listType}`);
        const limitedBooks = response.data.slice(0, 7);

        setBooksByList((prevLists) => {
          const isDuplicate = prevLists.some(
            (existingList) => existingList.listType === listType
          );
          const updatedLists = isDuplicate
            ? prevLists
            : [...prevLists, { listType, books: limitedBooks }];

          localStorage.setItem("nytBooks", JSON.stringify(updatedLists));
          return updatedLists;
        });
      } catch (err) {
        console.error(`Error fetching books for ${listType}:`, err);
        setError("Failed to fetch books");
      }
    };

    const fetchAllBooks = async () => {
      setLoading(true);
      setError(null);

      for (const listType of listTypes) {
        if (
          !booksByList.some(
            (existingList) => existingList.listType === listType
          )
        ) {
          await fetchBooksByType(listType);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setLoading(false);
    };

    const checkAndFetchBooks = () => {
      const storedData = localStorage.getItem("nytBooks");
      const lastFetchTime = localStorage.getItem("lastFetchTime");

      const now = new Date().getTime();
      const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;

      if (
        storedData &&
        lastFetchTime &&
        now - parseInt(lastFetchTime) < fiveDaysInMs
      ) {
        setBooksByList(JSON.parse(storedData));
      } else {
        fetchAllBooks();
        localStorage.setItem("lastFetchTime", now.toString());
      }
    };

    checkAndFetchBooks();
  }, [listTypes]);

  console.log(booksByList);

  useEffect(() => {
    const fetchCurrentlyReadingBooks = async () => {
      if (!userId) return;

      try {
        const shelfRef = doc(
          db,
          "users",
          userId,
          "shelves",
          "Currently Reading"
        );
        const shelfSnap = await getDoc(shelfRef);

        if (shelfSnap.exists()) {
          setCurrentlyReadingBooks(shelfSnap.data().books || []);
        } else {
          console.log("No such shelf!");
          setCurrentlyReadingBooks([]);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchCurrentlyReadingBooks();
  }, [userId]);

  const calculateRemainingPercentage = (
    pagesRead: number,
    totalPages: number
  ) => {
    console.log(pagesRead);
    console.log(totalPages);
    if (totalPages === 0 || pagesRead === 0) return 100;
    return Math.max(0, ((totalPages - pagesRead) / totalPages) * 100);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex flex-col flex-1 bg-brown-700 pb-20">
        <div className="flex flex-col gap-3 text-center items-center mt-32 mb-10">
          <p className="text-brown-100 open-sans text-4xl">
            But first, let's take a Shelfie!
          </p>
          <p className="text-brown-200 font-thin">
            Here you can shelf your books, review your stats and track your
            reading progress.
          </p>
        </div>

        <div className="flex flex-col items-center bg-orange-700 p-8 mt-8 gap-3">
          <p className="text-xl font-bold mb-4 text-brown-200">
            You are currently reading:
          </p>

          {currentlyReadingBooks.length > 3 ? (
            <Swiper
              spaceBetween={10}
              slidesPerView={3.6}
              loop={false}
              grabCursor={true}
              className="w-full"
            >
              {currentlyReadingBooks.map((book) => {
                const remainingPercentage = calculateRemainingPercentage(
                  book.pagesRead,
                  book.pagesTotal
                );
                return (
                  <SwiperSlide key={book.id}>
                    <div className="flex gap-6">
                      <a
                        href={`/googleBooks/${book.id}`}
                        className="w-32 h-44 bg-orange-100 shadow-3xl"
                      >
                        <img
                          src={book.image}
                          alt={book.title}
                          className="object-cover w-full h-full"
                        />
                      </a>
                      <div className="flex flex-col justify-between py-5">
                        <p className="text-brown-200 text-lg font-extrabold w-4/5">
                          {book.title}
                        </p>
                        <p className="text-brown-300">
                          Progress: {remainingPercentage.toFixed(0)}% left
                        </p>
                        <a
                          href="/shelves/Currently%20Reading"
                          className="text-orange-200 hover:underline"
                        >
                          Update progress
                        </a>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {currentlyReadingBooks.map((book) => {
                const remainingPercentage = calculateRemainingPercentage(
                  book.pagesRead,
                  book.pagesTotal
                );
                return (
                  <div className="flex gap-6" key={book.id}>
                    <a
                      href={`/googleBooks/${book.id}`}
                      className="w-32 h-44 bg-orange-100 shadow-3xl"
                    >
                      <img
                        src={book.image}
                        alt={book.title}
                        className="object-cover w-full h-full"
                      />
                    </a>
                    <div className="flex flex-col justify-between py-5">
                      <p className="text-brown-200 text-lg font-extrabold w-4/5">
                        {book.title}
                      </p>
                      <p className="text-brown-300">
                        Progress: {remainingPercentage.toFixed(0)}% left
                      </p>
                      <a
                        href="/shelves/Currently%20Reading"
                        className="text-orange-200 hover:underline"
                      >
                        Update progress
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            booksByList.map((list, index) => (
              <div key={index}>
                <div className="pt-12 pb-8 px-32">
                  <p className="text-brown-100 open-sans text-3xl">
                    {listTitleMap[list.listType] ||
                      list.listType.replace(/-/g, " ").replace("and", "&")}
                  </p>
                </div>

                <div className="">
                  <div className="pl-32">
                    {list.listType === "trade-fiction-paperback" && (
                      <Swiper
                        modules={[Navigation]}
                        spaceBetween={40}
                        slidesPerView={2.3}
                        grabCursor={true}
                        loop={true}
                      >
                        {list.books.slice(0, 7).map((book: Book) => (
                          <SwiperSlide key={book.primary_isbn13}>
                            <div className="flex gap-12 bg-orange-300 p-10 w-fit ">
                              <a
                                href={`/book/${book.primary_isbn13}`}
                                className="w-56 h-80 shadow-brown-300 shadow-3xl"
                                style={{
                                  backgroundImage: `url(${book.book_image})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              >
                                {!book.book_image && (
                                  <p className="flex items-center justify-center h-full">
                                    No Image Available
                                  </p>
                                )}
                              </a>
                              <div className="flex flex-col justify-between py-3">
                                <div>
                                  <p className="font-bold text-xl">
                                    {book.title || "No Title Available"}
                                  </p>
                                  <p className="font-semibold">
                                    {book.author || "No Author Available"}
                                  </p>
                                </div>
                                <p className="w-80">
                                  {book.description ||
                                    "No Description Available"}
                                </p>
                                <a
                                  href={`/book/${book.primary_isbn13}`}
                                  className="text-orange-100 cursor-pointer"
                                >
                                  Read more...
                                </a>
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    )}
                  </div>

                  <div className="px-32 flex justify-between">
                    {list.listType === "combined-print-and-e-book-fiction" &&
                      list.books.slice(0, 7).map((book: Book) => (
                        <a
                          href={`/book/${book.primary_isbn13}`}
                          className="flex flex-col text-center gap-2"
                          key={book.primary_isbn13}
                        >
                          {list.listType ===
                            "combined-print-and-e-book-fiction" && (
                            <p className="text-brown-200 font-bold text-3xl">
                              {book.rank || "N/A"}
                            </p>
                          )}
                          {book.book_image ? (
                            <img
                              src={book.book_image}
                              alt={book.title}
                              className="w-44 h-60 bg-orange-100 shadow-3xl mb-4"
                            />
                          ) : (
                            <div className="w-44 h-60 bg-gray-200 shadow-3xl mb-4 flex items-center justify-center">
                              <p>No Image Available</p>
                            </div>
                          )}
                          <p className="text-brown-200 font-bold w-40">
                            {book.title || "No Title Available"}
                          </p>
                          <p className="text-brown-200 font-thin ">
                            {book.author || "No Author Available"}
                          </p>
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Home;
