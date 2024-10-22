import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '@/components/NavBar';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';
import firebase from 'firebase/compat/app';
import { arrayUnion, FieldValue } from "firebase/firestore";
import { onAuthStateChanged, User } from 'firebase/auth';

const SearchPage = () => {
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
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!searchTerm) return;

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
      } catch (err) {
        setError('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchType, searchTerm]);

  const handleAddToShelf = async (book: any, shelf: string) => {
    if (!user) {
      console.error('No user is logged in');
      return;
    }

    try {
      const userId = user.uid; 
      const bookData = {
        id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors,
        image: book.volumeInfo.imageLinks?.thumbnail,
        publishedDate: book.volumeInfo.publishedDate,
      };

      const shelfRef = doc(db, 'users', userId, 'shelves', shelf);

      await setDoc(shelfRef, {
        books: arrayUnion(bookData),
      }, { merge: true }); 

      console.log(`Added book ${book.id} to ${shelf} shelf successfully!`);
    } catch (error) {
      console.error('Error adding book to shelf:', error);
    }
  };

  return (
    <div className="flex flex-col bg-orange-700">
      <NavBar />
      <h1 className="text-2xl my-10 text-center text-brown-100">Search Results for "{searchTerm}"</h1>
      <div className='flex flex-col items-center px-32 mb-20'>
        {loading ? (
        <p className='text-brown-200'>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="flex flex-col w-fit gap-6">
          {books.map((book) => (
            <div key={book.id} className="flex items-center p-4 border rounded-md w-full justify-between">
              <div className="flex-shrink-0">
                <img 
                  src={book.volumeInfo.imageLinks?.thumbnail} 
                  alt={book.volumeInfo.title} 
                  className="w-36 h-48 mr-4"
                />
              </div>
              
              <div className="">
                <h2 className="text-lg font-bold text-brown-100">{book.volumeInfo.title}</h2>
                <p className="text-sm">by {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}</p>
                <p className="text-sm">Published: {book.volumeInfo.publishedDate || 'N/A'}</p>
                <p className="text-sm mt-2">{book.volumeInfo.description?.slice(0, 150)}...</p>
              </div>

              <div className="flex-shrink-0 ml-4">
                <button 
                  onClick={() => handleAddToShelf(book, 'Read')}
                  className="bg-orange-200 hover:bg-orange-300 text-brown-500 px-4 py-2 rounded-md mb-2"
                >
                  Add to Read
                </button>
                <button 
                  onClick={() => handleAddToShelf(book, 'Currently Reading')}
                  className="bg-orange-200 hover:bg-orange-300 text-brown-500 px-4 py-2 rounded-md mb-2"
                >
                  Currently Reading
                </button>
                <button 
                  onClick={() => handleAddToShelf(book, 'To Read')}
                  className="bg-orange-200 hover:bg-orange-300 text-brown-500 px-4 py-2 rounded-md"
                >
                  To Read
                </button>
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