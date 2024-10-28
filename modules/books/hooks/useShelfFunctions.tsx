/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const useShelfFunctions = () => {
  const [user, setUser] = useState<User | null>(null);
  const [shelves, setShelves] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserShelves(user.uid);
      } else {
        setUser(null);
        setShelves({});
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserShelves = async (userId: string) => {
    try {
      const shelvesRef = collection(db, "users", userId, "shelves");
      const shelvesSnap = await getDocs(shelvesRef);
      const shelfBooks: { [key: string]: any[] } = {};

      for (const shelf of shelvesSnap.docs) {
        const shelfData = shelf.data();
        shelfBooks[shelf.id] = shelfData.books || [];
      }

      setShelves(shelfBooks);
    } catch (error) {
      console.error("Error fetching user shelves:", error);
    }
  };

  const handleAddToShelf = async (book: any, shelf: string) => {
    if (!user) {
      console.error("No user is logged in");
      return;
    }

    try {
      const userId = user.uid;
      const isbn =
        book.volumeInfo.industryIdentifiers?.find(
          (identifier: { type: string }) => identifier.type === "ISBN_13"
        )?.identifier || "";

      const bookData = {
        id: book.id,
        isbn,
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
        review: "",
        rereadDates: null,
        quotes: "",
        uploadedDocument: "",
      };

      const shelfRef = doc(db, "users", userId, "shelves", shelf);

      await setDoc(
        shelfRef,
        {
          books: arrayUnion(bookData),
        },
        { merge: true }
      );

      alert(`Added book to ${shelf} shelf successfully!`);
      fetchUserShelves(userId);
    } catch (error) {
      console.error("Error adding book to shelf:", error);
    }
  };

  return {
    user,
    shelves,
    fetchUserShelves,
    handleAddToShelf,
  };
};

export default useShelfFunctions;
