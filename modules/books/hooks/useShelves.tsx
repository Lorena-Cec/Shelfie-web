/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Book } from "../models/Book";

const useShelves = () => {
  const [selectedShelf, setSelectedShelf] = useState<string>("Read");
  const [books, setBooks] = useState<Book[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [hoveredRatings, setHoveredRatings] = useState<{
    [key: string]: number | null;
  }>({});
  const router = useRouter();
  const { shelf } = router.query;
  const [customShelves, setCustomShelves] = useState<string[]>([]);

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

  const fetchBooks = async () => {
    if (!userId) return;
    try {
      const shelfRef = doc(db, "users", userId, "shelves", selectedShelf);
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

  const fetchBooksOnShelf = async (shelf: string) => {
    if (!userId) return [];
    try {
      const shelfRef = doc(db, "users", userId, "shelves", shelf);
      const shelfSnap = await getDoc(shelfRef);

      if (shelfSnap.exists()) {
        return shelfSnap.data().books || []; // Return the books instead of setting state
      } else {
        console.log("No such shelf!");
        return []; // Return an empty array if no such shelf exists
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      return []; // Return an empty array in case of an error
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBooks();
    }
  }, [selectedShelf, userId]);

  const handleShelfSelect = (shelfName: string) => {
    setSelectedShelf(shelfName);
  };

  useEffect(() => {
    if (shelf) {
      setSelectedShelf(shelf as string);
    }
  }, [shelf, setSelectedShelf]);

  const handleDeleteBook = async (bookId: string) => {
    try {
      if (!userId) return;
      const shelfRef = doc(db, "users", userId, "shelves", selectedShelf);
      const shelfSnap = await getDoc(shelfRef);

      if (shelfSnap.exists()) {
        const books = shelfSnap.data().books || [];
        const updatedBooks = books.filter((book: any) => book.id !== bookId);

        await setDoc(shelfRef, { books: updatedBooks }, { merge: true });
        setBooks(updatedBooks);
        toast.success(`Book has been removed from the shelf!`);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handleMoveBook = async (bookId: string, newShelf: string) => {
    try {
      const book = books.find((b: any) => b.id === bookId);
      if (!userId || !book) return;

      const newShelfRef = doc(db, "users", userId, "shelves", newShelf);
      const newShelfSnap = await getDoc(newShelfRef);
      const newBooks =
        (newShelfSnap.exists() ? newShelfSnap.data().books : []) || [];

      await setDoc(
        newShelfRef,
        { books: [...newBooks, book] },
        { merge: true }
      );

      toast.success(`Book has been moved to the ${newShelf} shelf!`);
    } catch (error) {
      console.error("Error moving book:", error);

      toast.error("Error moving book. Please try again.");
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
        "users",
        userId,
        "shelves",
        selectedShelf
      );
      const newShelfRef = doc(db, "users", userId, "shelves", newShelf);

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
        { books: [...newShelfBooks, bookToMove] },
        { merge: true }
      );
    } catch (error) {
      console.error("Error moving book to shelf:", error);
    }
  };

  const handleUpdateBook = async (
    bookId: string,
    field: string,
    value: any
  ) => {
    try {
      if (!userId) return;
      const shelfRef = doc(db, "users", userId, "shelves", selectedShelf);
      const shelfSnap = await getDoc(shelfRef);

      if (shelfSnap.exists()) {
        const books = shelfSnap.data().books || [];
        const updatedBooks = books.map((book: any) =>
          book.id === bookId ? { ...book, [field]: value } : book
        );

        await setDoc(shelfRef, { books: updatedBooks }, { merge: true });
        setBooks(updatedBooks);

        if (field === "startReading" && value && selectedShelf === "To Read") {
          await moveBookToShelf(bookId, "Currently Reading", updatedBooks);
          toast.success("Book moved to Currently Reading shelf");
        } else if (
          field === "readDate" &&
          value &&
          (selectedShelf === "To Read" || selectedShelf === "Currently Reading")
        ) {
          await moveBookToShelf(bookId, "Read", updatedBooks);
          toast.success("Book moved to Read shelf");
        }
      }
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  const handleSetBooks = async (
    bookId: string,
    updates: Record<string, any>
  ) => {
    try {
      if (!userId) return;

      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === bookId ? { ...book, ...updates } : book
        )
      );
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  const handleUpdatesBook = async (
    bookId: string,
    updates: Record<string, any>
  ) => {
    try {
      if (!userId) return;

      const shelfRef = doc(db, "users", userId, "shelves", selectedShelf);
      const shelfSnap = await getDoc(shelfRef);

      if (shelfSnap.exists()) {
        const books = shelfSnap.data().books || [];
        const updatedBooks = books.map((book: any) =>
          book.id === bookId ? { ...book, ...updates } : book
        );

        await setDoc(shelfRef, { books: updatedBooks }, { merge: true });

        if (updates.startReading && selectedShelf === "To Read") {
          await moveBookToShelf(bookId, "Currently Reading", updatedBooks);
          toast.success("Book moved to Currently Reading shelf");
        } else if (
          updates.readDate &&
          (selectedShelf === "To Read" || selectedShelf === "Currently Reading")
        ) {
          await moveBookToShelf(bookId, "Read", updatedBooks);
          toast.success("Book moved to Read shelf");
        }
      }
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  const fetchAndSetShelves = async (userId: string) => {
    try {
      const shelvesCollectionRef = collection(db, "users", userId, "shelves");
      const querySnapshot = await getDocs(shelvesCollectionRef);

      if (querySnapshot.empty) {
        console.log("No shelves found for user:", userId);
        setCustomShelves([]);
      } else {
        const shelves = querySnapshot.docs.map((doc) => doc.id);
        const noDefaultShelves = shelves.filter(
          (shelf) => !["Read", "Currently Reading", "To Read"].includes(shelf)
        );
        setCustomShelves(noDefaultShelves);
      }
    } catch (error) {
      console.error("Error fetching shelves:", error);
    }
  };

  return {
    selectedShelf,
    setSelectedShelf: handleShelfSelect,
    books,
    userId,
    setBooks,
    fetchBooks,
    setUserId,
    handleDeleteBook,
    handleMoveBook,
    handleUpdateBook,
    handleUpdatesBook,
    hoveredRatings,
    setHoveredRatings,
    handleSetBooks,
    fetchAndSetShelves,
    customShelves,
    fetchBooksOnShelf,
  };
};

export default useShelves;
