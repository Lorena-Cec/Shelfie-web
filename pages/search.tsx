/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '@/components/NavBar';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';
import { arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import React from 'react';

const SearchPage = () => {
  const router = useRouter();
  const { searchType, searchTerm } = router.query;
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [shelves, setShelves] = useState<{ [key: string]: any[] }>({});

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

  const fetchUserShelves = async (userId: string) => {
    try {
      const shelvesRef = collection(db, 'users', userId, 'shelves');
      const shelvesSnap = await getDocs(shelvesRef);
      const shelfBooks: { [key: string]: any[] } = {};

      for (const shelf of shelvesSnap.docs) {
        const shelfData = shelf.data();
        shelfBooks[shelf.id] = shelfData.books || [];
      }

      setShelves(shelfBooks);
    } catch (error) {
      console.error('Error fetching user shelves:', error);
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      if (!searchTerm || !user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('/api/books', {
          params: {
            searchType,
            searchTerm,
          },
        });
        setBooks(response.data.items || []);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchType, searchTerm, user]);

  const handleAddToShelf = async (book: any, shelf: string) => {
    if (!user) {
      console.error('No user is logged in');
      return;
    }

    try {
      const userId = user.uid;
      const bookData = {
        id: book.id,
        isbn:
          book.volumeInfo.industryIdentifiers?.find(
            (identifier: { type: string }) => identifier.type === 'ISBN_13'
          )?.identifier || '',
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors,
        image: book.volumeInfo.imageLinks?.thumbnail,
        publishedDate: book.volumeInfo.publishedDate,
        pagesTotal: book.volumeInfo.pageCount,
        pagesRead: 0,
        rating: 0,
        addedDate: new Date().toISOString(),
        startReading: null,
        readDate: null,
        review: '',
      };

      const shelfRef = doc(db, 'users', userId, 'shelves', shelf);

      await setDoc(
        shelfRef,
        {
          books: arrayUnion(bookData),
        },
        { merge: true }
      );

      console.log(`Added book ${book.title} to ${shelf} shelf successfully!`);
      fetchUserShelves(userId);
    } catch (error) {
      console.error('Error adding book to shelf:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-orange-700">
      <NavBar />
      <h1 className="text-2xl my-10 text-center text-brown-100">
        Search Results for "{searchTerm}"
      </h1>
      <div className="flex flex-col items-center px-32 mb-20">
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
                <a href={`/book/${book.isbn}`} className="flex-shrink-0">
                  <img
                    src={book.volumeInfo.imageLinks?.thumbnail}
                    alt={book.volumeInfo.title}
                    className="w-36 h-52 mr-4"
                  />
                </a>
                <div className="col-span-4 flex flex-col justify-between h-full">
                  <a href={`/book/${book.isbn}`}>
                    <h2 className="text-xl font-bold text-brown-100">
                      {book.volumeInfo.title}
                    </h2>
                    <p className="text-brown-200 text-lg">
                      by{' '}
                      {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                    </p>
                    <p className="text-brown-300">
                      Published: {book.volumeInfo.publishedDate || 'N/A'}
                    </p>
                  </a>
                  <p className="text-brown-200 text-lg mb-4">
                    {book.volumeInfo.description?.slice(0, 100)}...{' '}
                    <a
                      href={`/book/${book.isbn}`}
                      className="text-brown-300 hover:text-brown-100"
                    >
                      Find out more
                    </a>
                  </p>
                </div>
                <div className="flex flex-col ml-4">
                  {shelves['Read'] &&
                  shelves['Read'].some((b) => b.id === book.id) ? (
                    <div>
                      <p className="text-brown-100">
                        This book is on your Shelf.
                      </p>
                      <button
                        onClick={() => router.push('/shelves/Read')}
                        className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md"
                      >
                        View Read Shelf
                      </button>
                    </div>
                  ) : shelves['Currently Reading'] &&
                    shelves['Currently Reading'].some(
                      (b) => b.id === book.id
                    ) ? (
                    <div>
                      <p className="text-brown-100">
                        You have this book on your Shelf.
                      </p>
                      <button
                        onClick={() =>
                          router.push('/shelves/Currently%20Reading')
                        }
                        className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md"
                      >
                        View Currently Reading Shelf
                      </button>
                    </div>
                  ) : shelves['To Read'] &&
                    shelves['To Read'].some((b) => b.id === book.id) ? (
                    <div>
                      <p className="text-brown-100">
                        You have this book on your Shelf.
                      </p>
                      <button
                        onClick={() => router.push('/shelves/To%20Read')}
                        className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md"
                      >
                        View To Read Shelf
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAddToShelf(book, 'Read')}
                        className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md mb-2"
                      >
                        Add to Read
                      </button>
                      <button
                        onClick={() =>
                          handleAddToShelf(book, 'Currently Reading')
                        }
                        className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md mb-2"
                      >
                        Currently Reading
                      </button>
                      <button
                        onClick={() => handleAddToShelf(book, 'To Read')}
                        className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md"
                      >
                        To Read
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
