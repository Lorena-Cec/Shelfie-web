import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc } from "firebase/firestore"; 
import { onAuthStateChanged } from 'firebase/auth';

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

    fetchBooks();
  }, [selectedShelf]);

  const handleShelfSelect = (shelf: string) => {
    setSelectedShelf(shelf);
  };

  const displayShelf = (shelfName: string) => {
    return (
      <div className="text-center mt-8">
        <h3 className="text-2xl font-bold">{shelfName}</h3>
        {books.length === 0 ? (
          <p className="text-sm mt-4">Add books to {shelfName} - <a href="/browse" className="text-blue-500">Browse here</a></p>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {books.map((book: any) => (
              <div key={book.id} className="flex flex-col items-center bg-orange-100 p-4 shadow-md">
                <img src={book.image} alt={book.title} className="w-32 h-44 mb-4" />
                <p>{book.title}</p>
                <p>{book.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
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
