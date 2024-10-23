// /modules/shelves/hooks/useShelves.ts
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore"; 
import { onAuthStateChanged } from 'firebase/auth';

const useShelves = () => {
  const [selectedShelf, setSelectedShelf] = useState<string>('Read');
  const [books, setBooks] = useState<any[]>([]); 
  const [userId, setUserId] = useState<string | null>(null); 
  const [hoveredRatings, setHoveredRatings] = useState<{ [key: string]: number | null }>({});

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
          console.log("No such shelf!");
          setBooks([]); 
        }
      } catch (error) {
        console.error("Error fetching books:", error);
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
      const newBooks = (newShelfSnap.exists() ? newShelfSnap.data().books : []) || [];

      await setDoc(newShelfRef, { books: [...newBooks, book] }, { merge: true });
    } catch (error) {
      console.error('Error moving book:', error);
    }
  };

  const handleUpdateBook = async (bookId: string, field: string, value: any) => {
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
      }
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  return {
    selectedShelf,
    setSelectedShelf: handleShelfSelect,
    books,
    handleDeleteBook,
    handleMoveBook,
    handleUpdateBook,
    hoveredRatings,
    setHoveredRatings,
  };
};

export default useShelves;
