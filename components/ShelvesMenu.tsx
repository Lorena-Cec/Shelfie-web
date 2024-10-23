import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc } from "firebase/firestore"; 
import { onAuthStateChanged } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';

const ShelvesMenu: React.FC = () => {
  const [selectedShelf, setSelectedShelf] = useState<string>('Read');
  const [books, setBooks] = useState<any[]>([]); 
  const [userId, setUserId] = useState<string | null>(null); 

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) =>{
            if(user){
                setUserId(user.uid);
            } else{
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

  const displayShelf = (shelfName: string) => {
    const handleUpdateBook = async (bookId: string, field: string, value: any) => {
      try {
        const userId = 'userId'; // Morate dobiti stvarni userId iz stanja
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
  
    return (
      <div className="text-center mt-8 w-full text-brown-100">
        {books.length === 0 ? (
          <p className="text-sm mt-4">Add books to {shelfName} - <a href="/browse" className="text-blue-500">Browse here</a></p>
        ) : (
          <div className="flex flex-col gap-2 mt-4">
            <div className="grid grid-cols-6 gap-4 px-16 py-4 font-bold bg-orange-300">
              <p>COVER</p>
              <p>TITLE & AUTHOR</p>
              <p>RATING</p>
              <p>ADDED DATE</p>
              <p>START OF READING</p>
              <p>READ DATE</p>
            </div>
            
            {books.map((book: any) => (
              <div key={book.id} className="grid grid-cols-6 gap-4 place-items-center px-16 py-8 bg-orange-600">
                <img src={book.image} alt={book.title} className="w-36 h-52 shadow-3xl " />
                <div>
                  <p className='text-xl font-bold'>{book.title}</p>
                  <p>{book.authors?.join(', ')}</p>
                </div>
                
                {/* RATING */}
                <input
                  type="number"
                  value={book.rating}
                  onChange={(e) => handleUpdateBook(book.id, 'rating', Number(e.target.value))}
                  className="w-12 p-1 border rounded"
                />
  
                {/* ADDED DATE */}
                <p className='text-lg'>{new Date(book.addedDate).toLocaleDateString()}</p>
  
                {/* START OF READING */}
                <input
                  type="date"
                  value={book.startReading ? new Date(book.startReading).toISOString().substring(0, 10) : ''}
                  onChange={(e) => handleUpdateBook(book.id, 'startReading', e.target.value)}
                  className="p-1 border rounded"
                />
  
                {/* READ DATE */}
                <input
                  type="date"
                  value={book.readDate ? new Date(book.readDate).toISOString().substring(0, 10) : ''}
                  onChange={(e) => handleUpdateBook(book.id, 'readDate', e.target.value)}
                  className="p-1 border rounded"
                />
  
                
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  

  return (
    <div className='flex flex-col items-center w-full'>
      <div className="flex items-center mt-12 w-fit rounded-full bg-brown-500">
        <p
          className={`text-lg px-16 py-4 cursor-pointer rounded-full ${
            selectedShelf === 'Read' ? 'bg-orange-300 text-brown-700' : 'text-brown-100'
          }`}
          onClick={() => handleShelfSelect('Read')}
        >
          Read
        </p>
        <p
          className={`text-lg px-16 -ml-8 py-4 cursor-pointer rounded-full ${
            selectedShelf === 'Currently Reading' ? 'bg-orange-300 text-brown-700' : 'text-brown-100'
          }`}
          onClick={() => handleShelfSelect('Currently Reading')}
        >
          Currently Reading
        </p>
        <p
          className={`text-lg px-16 -ml-8 py-4 cursor-pointer rounded-full ${
            selectedShelf === 'To Read' ? 'bg-orange-300 text-brown-700' : 'text-brown-100'
          }`}
          onClick={() => handleShelfSelect('To Read')}
        >
          To Read
        </p>
      </div>
      {displayShelf(selectedShelf)} 
    </div>
  );
};

export default ShelvesMenu;
