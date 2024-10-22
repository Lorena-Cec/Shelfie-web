import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebaseConfig'; 
import NavBar from '@/components/NavBar';
import ShelvesMenu from '@/components/ShelvesMenu';
import createShelvesForUser from '@/hooks/createShelvesForUser';

const Shelves: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [shelves, setShelves] = useState<any>({ read: [], currentlyReading: [], toRead: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {   
        setUser(user);
        createShelvesForUser(user.uid);
        fetchShelves(user.uid); 
      } else {
        router.push('/register'); 
      }
    });
    return () => unsubscribe();
  }, []);

  
  const fetchShelves = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      setShelves(userDoc.data()?.shelves || { read: [], currentlyReading: [], toRead: [] });
    }
    setLoading(false);
  };

  
  const displayShelf = (shelfName: string, books: any[]) => {
    return (
      <div className="text-center mt-8">
        <h3 className="text-2xl font-bold">{shelfName}</h3>
        {books.length === 0 ? (
          <p className="text-sm mt-4">Add books to {shelfName} - <a href="/browse" className="text-blue-500">Browse here</a></p>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {books.map((book: any) => (
              <div key={book.isbn} className="flex flex-col items-center bg-orange-100 p-4 shadow-md">
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col h-screen bg-orange-700">
        <NavBar></NavBar>
        <div className='flex flex-col items-center'>
            <h1 className="text-4xl font-bold mt-24 text-brown-100">Take a Shelfie</h1>
            <p className="text-lg mt-4 text-brown-200">Add your books to shelves or create new shelves</p>

            <ShelvesMenu></ShelvesMenu>

        </div>
        
    </div>
  );
};

export default Shelves;
