/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebaseConfig";
import NavBar from "@/components/NavBar";
import { ShelvesMenu } from "@/modules/books";
import createShelvesForUser from "@/hooks/createShelvesForUser";
import Footer from "@/components/Footer";
import Papa from "papaparse";
import axios from "axios";

const Shelves: React.FC = () => {
  const [, setUser] = useState<any>(null);
  const [, setShelves] = useState<any>({
    read: [],
    currentlyReading: [],
    toRead: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [importedBooks, setImportedBooks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        createShelvesForUser(user.uid);
        fetchShelves(user.uid);
      } else {
        router.push("/register");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchShelves = async (userId: string) => {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data()?.shelves || {};
      setShelves({
        Read: data.Read || [],
        "To Read": data["To Read"] || [],
        "Currently Reading": data["Currently Reading"] || [],
      });
    } else {
      setShelves({
        Read: [],
        "To Read": [],
        "Currently Reading": [],
      });
    }
    setLoading(false);
  };

  const mapShelfName = (shelf: string) => {
    switch (shelf.toLowerCase()) {
      case "read":
        return "Read";
      case "to-read":
        return "To Read";
      case "currently-reading":
        return "Currently Reading";
      default:
        return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const books = results.data.map((row: any) => ({
            title: row.Title,
            author: row.Author,
            exclusiveShelf: row["Exclusive Shelf"],
            dateRead: row["Date Read"],
            rating: row["My Rating"],
            review: row["My Review"],
          }));
          setImportedBooks(books);
          setShowModal(true);
        },
        error: (err) => console.error("Error parsing CSV file:", err),
      });
    }
  };

  const searchBooksOnGoogleBooks = async (title: string, author: string) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
          title
        )}+inauthor:${encodeURIComponent(author)}`
      );
      const bookData = response.data.items?.[0];
      return bookData
        ? {
            id: bookData.id,
            title: bookData.volumeInfo.title,
            authors: bookData.volumeInfo.authors,
            image: bookData.volumeInfo.imageLinks?.thumbnail,
            publishedDate: bookData.volumeInfo.publishedDate,
            pagesTotal: bookData.volumeInfo.pageCount,
            pagesRead: 0,
            rating: 0,
            addedDate: new Date().toISOString(),
            startReading: null,
            readDate: null,
            review: "",
            rereadDates: null,
            quotes: "",
            uploadedDocument: "",
          }
        : null;
    } catch (error) {
      console.error("Error searching Google Books:", error);
      return null;
    }
  };

  const saveBooksToShelves = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("Please log in to save your books.");
      return;
    }

    try {
      const shelvesRef = doc(db, "users", userId);
      const currentlyReadingRef = collection(shelvesRef, "Currently Reading");
      const toReadRef = collection(shelvesRef, "To Read");
      const readRef = collection(shelvesRef, "Read");

      const currentlyReadingSnap = await getDocs(currentlyReadingRef);
      const toReadSnap = await getDocs(toReadRef);
      const readSnap = await getDocs(readRef);

      const currentlyReadingBooks = currentlyReadingSnap.docs.map((doc) =>
        doc.data()
      );
      const toReadBooks = toReadSnap.docs.map((doc) => doc.data());
      const readBooks = readSnap.docs.map((doc) => doc.data());

      console.log("Currently Reading books:", currentlyReadingBooks);
      console.log("To Read books:", toReadBooks);
      console.log("Read books:", readBooks);

      const shelves = {
        "Currently Reading": currentlyReadingBooks,
        "To Read": toReadBooks,
        Read: readBooks,
      };

      for (const book of importedBooks) {
        const googleBook = await searchBooksOnGoogleBooks(
          book.title,
          book.author
        );

        if (googleBook) {
          const bookEntry = {
            id: googleBook.id,
            title: googleBook.title,
            author: googleBook.authors?.join(", "),
            image: googleBook.image,
            pagesTotal: googleBook.pagesTotal,
            rating: book.rating,
            dateRead: book.dateRead || "",
            publishedDate: book.volumeInfo.publishedDate,
            pagesRead: book.pagesRead,
            addedDate: new Date().toISOString(),
            startReading: null,
            readDate: book.readDate,
            review: "",
            rereadDates: null,
            quotes: "",
            uploadedDocument: "",
          };

          const shelfName = mapShelfName(book.exclusiveShelf);

          // Ako je shelfName važeći i ako ta polica postoji, dodaj knjigu u policu
          if (shelfName && shelves[shelfName]) {
            shelves[shelfName].push(bookEntry);
            console.log(`Added to shelf: ${shelfName}`, shelves[shelfName]);

            // Spremi ažuriranu policu u Firestore
            const shelfRef = doc(db, "users", userId, "shelves", shelfName);
            await setDoc(
              shelfRef,
              { books: shelves[shelfName] },
              { merge: true }
            );
          }
        } else {
          console.log("No Google Book found for:", book.title);
        }
      }

      alert("Books successfully imported and saved to shelves!");
      setShowModal(false);
      setImportedBooks([]);
    } catch (error) {
      console.error("Error saving books:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-brown-700">
      <NavBar />
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mt-24 text-brown-100">
          Take a Shelfie
        </h1>
        <p className="text-lg mt-4 text-brown-200">
          Add your books to shelves or create new shelves
        </p>

        <ShelvesMenu />
        <div className="mt-8">
          <label className="bg-orange-500 text-white py-2 px-4 rounded cursor-pointer">
            Import Goodreads CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="h-5/6 w-1/2">
            <div className="bg-white w-full h-5/6 p-6 rounded shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-brown-100">
                Imported Books
              </h2>
              <div className="h-5/6">
                <ul className="overflow-y-auto max-h-full">
                  {importedBooks.map((book, index) => (
                    <li
                      key={index}
                      className="mb-2 border-b border-gray-200 pb-2"
                    >
                      <p className="font-semibold text-brown-100">
                        {book.title}
                      </p>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                      <p className="text-sm text-gray-600">
                        Shelf: {book.exclusiveShelf}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBooksToShelves}
                  className="bg-orange-500 text-white px-4 py-2 rounded"
                >
                  Save to Shelves
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Shelves;
