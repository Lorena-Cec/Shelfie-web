import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebaseConfig';
import { arrayUnion, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ShelvesMenu: React.FC = () => {
  const [selectedShelf, setSelectedShelf] = useState<string>('Read');
  const [books, setBooks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hoveredRatings, setHoveredRatings] = useState<{
    [key: string]: number | null;
  }>({});

  const handleMouseEnter = (bookId: string, rating: number) => {
    setHoveredRatings((prev) => ({ ...prev, [bookId]: rating }));
  };

  const handleMouseLeave = (bookId: string) => {
    setHoveredRatings((prev) => ({ ...prev, [bookId]: null }));
  };
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
    const fetchBooks = async () => {
      if (!userId) return;
      try {
        const shelfRef = doc(db, 'users', userId, 'shelves', selectedShelf);
        const shelfSnap = await getDoc(shelfRef);

        if (shelfSnap.exists()) {
          setBooks(shelfSnap.data().books || []);
        } else {
          console.log('No such shelf!');
          setBooks([]);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    if (userId) {
      fetchBooks();
    }
  }, [selectedShelf, userId]);

  const handleShelfSelect = (shelf: string) => {
    setSelectedShelf(shelf);
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      if (!userId) return;
      const shelfRef = doc(db, 'users', userId, 'shelves', selectedShelf);
      const shelfSnap = await getDoc(shelfRef);

      if (shelfSnap.exists()) {
        const books = shelfSnap.data().books || [];
        const updatedBooks = books.filter((book: any) => book.id !== bookId);

        await setDoc(shelfRef, { books: updatedBooks }, { merge: true });
        setBooks(updatedBooks);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleMoveBook = async (bookId: string, newShelf: string) => {
    try {
      await handleDeleteBook(bookId);

      const book = books.find((b: any) => b.id === bookId);
      if (!userId) return;

      const newShelfRef = doc(db, 'users', userId, 'shelves', newShelf);
      const newShelfSnap = await getDoc(newShelfRef);
      const newBooks =
        (newShelfSnap.exists() ? newShelfSnap.data().books : []) || [];

      await setDoc(
        newShelfRef,
        { books: [...newBooks, book] },
        { merge: true }
      );
    } catch (error) {
      console.error('Error moving book:', error);
    }
  };

  const moveBookToShelf = async (
    bookId: string,
    newShelf: string,
    updatedBooks: any[]
  ) => {
    try {
      if (!userId) return;
      const currentShelfRef = doc(
        db,
        'users',
        userId,
        'shelves',
        selectedShelf
      );
      const newShelfRef = doc(db, 'users', userId, 'shelves', newShelf);

      const currentBooks = updatedBooks.filter(
        (book: any) => book.id !== bookId
      );
      await setDoc(currentShelfRef, { books: currentBooks }, { merge: true });

      setBooks(currentBooks);

      const newShelfSnap = await getDoc(newShelfRef);
      const newShelfBooks = newShelfSnap.exists()
        ? newShelfSnap.data().books || []
        : [];

      const bookToMove = updatedBooks.find((book: any) => book.id === bookId);
      await setDoc(
        newShelfRef,
        { books: arrayUnion(bookToMove) },
        { merge: true }
      );
    } catch (error) {
      console.error('Error moving book to shelf:', error);
    }
  };

  const displayShelf = (shelfName: string) => {
    const handleUpdateBook = async (
      bookId: string,
      field: string,
      value: any
    ) => {
      try {
        if (!userId) return;
        const shelfRef = doc(db, 'users', userId, 'shelves', selectedShelf);
        const shelfSnap = await getDoc(shelfRef);

        if (shelfSnap.exists()) {
          const books = shelfSnap.data().books || [];
          const updatedBooks = books.map((book: any) =>
            book.id === bookId ? { ...book, [field]: value } : book
          );

          await setDoc(shelfRef, { books: updatedBooks }, { merge: true });
          setBooks(updatedBooks);

          if (
            field === 'startReading' &&
            value &&
            selectedShelf === 'To Read'
          ) {
            await moveBookToShelf(bookId, 'Currently Reading', updatedBooks);
            console.log('moving', selectedShelf);
            toast.success('Book moved to shelf: Currently Reading');
          } else if (
            field === 'readDate' &&
            value &&
            (selectedShelf === 'To Read' ||
              selectedShelf === 'Currently Reading')
          ) {
            await moveBookToShelf(bookId, 'Read', updatedBooks);
            toast.success('Book moved to shelf: Read');
          }
        }
      } catch (error) {
        console.error('Error updating book:', error);
      }
    };

    return (
      <div className="text-center mt-8 w-full ">
        {books.length === 0 ? (
          <p className="text-sm mt-4">
            Add books to {shelfName} -{' '}
            <a href="/browse" className="text-blue-500">
              Browse here
            </a>
          </p>
        ) : (
          <div className="flex flex-col gap-2 mt-4">
            <div
              className={`grid ${selectedShelf === 'To Read' ? 'grid-cols-6' : 'grid-cols-7'} gap-4 px-16 py-4 font-bold bg-orange-300 text-brown-700`}
            >
              <div></div>
              <p>TITLE & AUTHOR</p>
              {selectedShelf != 'To Read' && <p>RATING</p>}
              <p>ADDED DATE</p>
              <p>START OF READING</p>
              <p>READ DATE</p>
              <div></div>
            </div>

            {books.map((book: any) => (
              <div
                key={book.id}
                className={`grid ${selectedShelf === 'To Read' ? 'grid-cols-6' : 'grid-cols-7'} gap-4 place-items-center px-16 py-8 bg-orange-600 text-brown-100`}
              >
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-36 h-52 shadow-3xl "
                />
                <div>
                  <p className="text-xl font-bold">{book.title}</p>
                  <p>{book.authors?.join(', ')}</p>
                </div>

                {/* RATING */}
                {selectedShelf != 'To Read' && (
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <img
                        key={index}
                        src={`/stars${index < (hoveredRatings[book.id] || book.rating) ? index + 1 : 0}.png`}
                        alt={`${index + 1} star`}
                        className="w-8 h-8 cursor-pointer"
                        onMouseEnter={() =>
                          handleMouseEnter(book.id, index + 1)
                        }
                        onMouseLeave={() => handleMouseLeave(book.id)}
                        onClick={() =>
                          handleUpdateBook(book.id, 'rating', index + 1)
                        }
                      />
                    ))}
                  </div>
                )}

                {/* ADDED DATE */}
                <p className="text-lg">
                  {new Date(book.addedDate).toLocaleDateString()}
                </p>

                {/* START OF READING */}
                <input
                  type="date"
                  value={
                    book.startReading
                      ? new Date(book.startReading)
                          .toISOString()
                          .substring(0, 10)
                      : ''
                  }
                  onChange={(e) =>
                    handleUpdateBook(book.id, 'startReading', e.target.value)
                  }
                  className="p-1 border rounded"
                />

                {/* READ DATE */}
                <input
                  type="date"
                  value={
                    book.readDate
                      ? new Date(book.readDate).toISOString().substring(0, 10)
                      : ''
                  }
                  onChange={(e) =>
                    handleUpdateBook(book.id, 'readDate', e.target.value)
                  }
                  className="p-1 border rounded"
                />
                {/* DELETE & MOVE ACTIONS */}
                <div className="flex flex-col items-center gap-2">
                  {/* Delete Button */}
                  <button
                    className="bg-orange-200 hover:bg-orange-300 text-brown-700 px-4 py-2 rounded-md mb-2 w-full"
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    Delete
                  </button>

                  {/* Move to Shelf Dropdown */}
                  <select
                    className="px-4 py-2 rounded"
                    value=""
                    onChange={(e) => handleMoveBook(book.id, e.target.value)}
                  >
                    <option value="" disabled>
                      Move to...
                    </option>
                    <option value="Read">Read</option>
                    <option value="Currently Reading">Currently Reading</option>
                    <option value="To Read">To Read</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center mt-12 w-fit rounded-full bg-brown-500">
        <p
          className={`text-lg px-16 py-4 cursor-pointer rounded-full ${
            selectedShelf === 'Read'
              ? 'bg-orange-300 text-brown-700'
              : 'text-brown-100'
          }`}
          onClick={() => handleShelfSelect('Read')}
        >
          Read
        </p>
        <p
          className={`text-lg px-16 -ml-8 py-4 cursor-pointer rounded-full ${
            selectedShelf === 'Currently Reading'
              ? 'bg-orange-300 text-brown-700'
              : 'text-brown-100'
          }`}
          onClick={() => handleShelfSelect('Currently Reading')}
        >
          Currently Reading
        </p>
        <p
          className={`text-lg px-16 -ml-8 py-4 cursor-pointer rounded-full ${
            selectedShelf === 'To Read'
              ? 'bg-orange-300 text-brown-700'
              : 'text-brown-100'
          }`}
          onClick={() => handleShelfSelect('To Read')}
        >
          To Read
        </p>
      </div>
      {displayShelf(selectedShelf)}
      <ToastContainer />
    </div>
  );
};

export default ShelvesMenu;
