import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../../../lib/firebaseConfig';
import NavBar from '@/components/NavBar';
import { ShelvesMenu } from '@/modules/shelves';
import createShelvesForUser from '@/hooks/createShelvesForUser';

const Shelves: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [shelves, setShelves] = useState<any>({
    read: [],
    currentlyReading: [],
    toRead: [],
  });
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
      setShelves(
        userDoc.data()?.shelves || {
          read: [],
          currentlyReading: [],
          toRead: [],
        }
      );
    }
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-orange-700">
      <NavBar></NavBar>
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mt-24 text-brown-100">
          Take a Shelfie
        </h1>
        <p className="text-lg mt-4 text-brown-200">
          Add your books to shelves or create new shelves
        </p>

        <ShelvesMenu></ShelvesMenu>
      </div>
    </div>
  );
};

export default Shelves;
