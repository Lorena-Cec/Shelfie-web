/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import NavBar from '@/components/NavBar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { Navigation } from 'swiper/modules';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

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
    'combined-print-and-e-book-fiction',
    'graphic-books-and-manga',
    'trade-fiction-paperback',
    'young-adult-hardcover',
  ];

  const listTitleMap: { [key: string]: string } = {
    'combined-print-and-e-book-fiction': 'Current Book Ranking',
    'graphic-books-and-manga': 'Graphic Novels',
    'trade-fiction-paperback': 'Readers Choice',
    'young-adult-hardcover': 'Young Adult Favorites',
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
    const fetchNytBooks = async () => {
      setLoading(true);
      setError(null);
      const fetchedBooks: BookList[] = [];

      try {
        const storedBooks = localStorage.getItem('nytBooks');
        if (storedBooks) {
          setBooksByList(JSON.parse(storedBooks));
        } else {
          for (const listType of listTypes) {
            const response = await axios.get(
              `/api/nytBooks?listType=${listType}`
            );
            const limitedBooks = response.data.slice(0, 10);
            fetchedBooks.push({ listType, books: limitedBooks });
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          localStorage.setItem('nytBooks', JSON.stringify(fetchedBooks));
          setBooksByList(fetchedBooks);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchNytBooks();
  }, []);

  useEffect(() => {
    const fetchCurrentlyReadingBooks = async () => {
      if (!userId) return;

      try {
        const shelfRef = doc(
          db,
          'users',
          userId,
          'shelves',
          'Currently Reading'
        );
        const shelfSnap = await getDoc(shelfRef);

        if (shelfSnap.exists()) {
          setCurrentlyReadingBooks(shelfSnap.data().books || []);
        } else {
          console.log('No such shelf!');
          setCurrentlyReadingBooks([]);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchCurrentlyReadingBooks();
  }, [userId]);

  const calculateRemainingPercentage = (
    pagesRead: number,
    totalPages: number
  ) => {
    if (totalPages === 0) return 0;
    return Math.max(0, ((totalPages - pagesRead) / totalPages) * 100);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex flex-col flex-1 bg-orange-700 pb-20">
        <div className="flex flex-col gap-3 text-center items-center mt-32 mb-10">
          <p className="text-brown-100 open-sans text-4xl">
            But first, let's take a Shelfie!
          </p>
          <p className="text-brown-200 font-thin">
            Here you can shelf your books, review your stats and track your
            reading progress.
          </p>
        </div>

        <div className="flex flex-col items-center bg-orange-400 p-8 mt-8 gap-3">
          <p className="text-xl font-bold mb-4">You are currently reading:</p>
          <div className="flex gap-12">
            {currentlyReadingBooks.map((book) => {
              const remainingPercentage = calculateRemainingPercentage(
                book.pagesRead,
                book.pagesTotal
              );
              return (
                <div key={book.id} className="flex gap-6">
                  <div className="w-32 h-44 bg-orange-100 shadow-3xl">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-5">
                    <p className="text-brown-200 text-lg font-extrabold w-4/5">
                      {book.title}
                    </p>
                    <p>Progress: {remainingPercentage.toFixed(0)}% left</p>
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
                      list.listType.replace(/-/g, ' ').replace('and', '&')}
                  </p>
                </div>
                <div className="flex gap-24 px-32">
                  {list.listType === 'graphic-books-and-manga' && (
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={40}
                      slidesPerView={2.3}
                      grabCursor={true}
                      loop={true}
                    >
                      {list.books.slice(0, 5).map((book: Book) => (
                        <SwiperSlide key={book.primary_isbn13}>
                          <div className="flex gap-12 bg-orange-400 p-10 w-fit ">
                            <div
                              className="w-56 h-72 bg-orange-100 shadow-brown-300 shadow-3xl"
                              style={{
                                backgroundImage: `url(${book.book_image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }}
                            >
                              {!book.book_image && (
                                <p className="flex items-center justify-center h-full">
                                  No Image Available
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col justify-between py-3">
                              <div>
                                <p className="font-bold">
                                  {book.title || 'No Title Available'}
                                </p>
                                <p>{book.author || 'No Author Available'}</p>
                              </div>
                              <p className="w-80">
                                {book.description || 'No Description Available'}
                              </p>
                              <p className="text-blue-500 cursor-pointer">
                                Read more...
                              </p>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}

                  {list.listType === 'combined-print-and-e-book-fiction' &&
                    list.books.slice(0, 7).map((book: Book) => (
                      <div
                        className="flex flex-col text-center gap-2"
                        key={book.primary_isbn13}
                      >
                        <p className="text-brown-200 font-bold text-3xl">
                          {book.rank || 'N/A'}
                        </p>
                        {book.book_image ? (
                          <img
                            src={book.book_image}
                            alt={book.title}
                            className="w-44 h-56 bg-orange-100 shadow-3xl mb-4"
                          />
                        ) : (
                          <div className="w-44 h-56 bg-gray-200 shadow-3xl mb-4 flex items-center justify-center">
                            <p>No Image Available</p>
                          </div>
                        )}
                        <p className="text-brown-200 font-thin">
                          {book.title || 'No Title Available'}
                        </p>
                        <p className="text-brown-200 font-thin">
                          {book.author || 'No Author Available'}
                        </p>
                      </div>
                    ))}

                  {list.listType === 'young-adult-hardcover' && (
                    <div className="bg-orange-300 flex w-full gap-4 p-10 items-center">
                      {list.listType === 'young-adult-hardcover' &&
                        list.books.slice(0, 5).map((book: Book) => (
                          <div
                            className="flex flex-col items-center text-center gap-2 w-1/4"
                            key={book.primary_isbn13}
                          >
                            {book.book_image ? (
                              <img
                                src={book.book_image}
                                alt={book.title}
                                className="w-44 h-56 bg-orange-100 shadow-3xl mb-4"
                              />
                            ) : (
                              <div className="w-44 h-56 bg-gray-200 shadow-3xl mb-4 flex items-center justify-center">
                                <p>No Image Available</p>
                              </div>
                            )}
                            <p className="text-brown-200 font-thin">
                              {book.title || 'No Title Available'}
                            </p>
                            <p className="text-brown-200 font-thin">
                              {book.author || 'No Author Available'}
                            </p>
                          </div>
                        ))}

                      <img
                        src="/wallpaper.png"
                        alt="Wallpaper"
                        className="w-80"
                      />
                    </div>
                  )}

                  {list.listType === 'trade-fiction-paperback' &&
                    list.books.slice(1, 7).map((book: Book) => (
                      <div
                        className="flex flex-col items-center text-center gap-2 w-1/4"
                        key={book.primary_isbn13}
                      >
                        {book.book_image ? (
                          <img
                            src={book.book_image}
                            alt={book.title}
                            className="w-44 h-56 bg-orange-100 shadow-3xl mb-4"
                          />
                        ) : (
                          <div className="w-44 h-56 bg-gray-200 shadow-3xl mb-4 flex items-center justify-center">
                            <p>No Image Available</p>
                          </div>
                        )}
                        <p className="text-brown-200 font-thin">
                          {book.title || 'No Title Available'}
                        </p>
                        <p className="text-brown-200 font-thin">
                          {book.author || 'No Author Available'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <footer className="bg-orange-800 text-white py-8 px-32 pt-12">
        <div className="container mx-auto grid grid-cols-1  md:grid-cols-3 gap-8">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-gray-300">
                  Home
                </a>
              </li>
              <li>
                <a href="/bestsellers" className="hover:text-gray-300">
                  Bestsellers
                </a>
              </li>
              <li>
                <a href="/categories" className="hover:text-gray-300">
                  Categories
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-gray-300">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-gray-300">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                Email:{' '}
                <a
                  href="mailto:support@bookshelf.com"
                  className="hover:text-gray-300"
                >
                  support@shelfie.com
                </a>
              </li>
              <li>
                Phone:{' '}
                <a href="tel:+123456789" className="hover:text-gray-300">
                  +123 456 789
                </a>
              </li>
              <li>
                Follow us on:
                <div className="flex space-x-3 mt-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    className="hover:text-gray-300"
                    rel="noreferrer"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    className="hover:text-gray-300"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    className="hover:text-gray-300"
                    rel="noreferrer"
                  >
                    Twitter
                  </a>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex flex-col pr-10">
            <h3 className="text-xl font-bold mb-4">About Us</h3>
            <p className="text-sm">
              Welcome to our book tracking platform, where you can shelf your
              books, track your reading progress, and explore the latest
              bestsellers. Stay tuned for exciting features and a wide selection
              of genres!
            </p>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Shelfie. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
