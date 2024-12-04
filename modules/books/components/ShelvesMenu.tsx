import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaTrash } from "react-icons/fa";
import useShelves from "../hooks/useShelves";
import ShelfDisplay from "./ShelfDisplay";
import Link from "next/link";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ShelvesMenu: React.FC = () => {
  const {
    selectedShelf,
    setSelectedShelf,
    books,
    handleUpdateBook,
    fetchAndSetShelves,
    customShelves,
  } = useShelves();

  const [, setCustomShelves] = useState<string[]>([]);
  const [newShelfName, setNewShelfName] = useState("");
  const [isAddingShelf, setIsAddingShelf] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchAndSetShelves(user.uid);
        console.log();
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const createShelfForUser = async (userId: string, newShelfName: string) => {
    if (!newShelfName.trim()) return;

    const shelfRef = doc(db, "users", userId, "shelves", newShelfName);
    const shelfDoc = await getDoc(shelfRef);

    if (!shelfDoc.exists()) {
      await setDoc(shelfRef, { books: [] });
      console.log("Shelf created:", newShelfName);
    } else {
      console.log("Shelf already exists:", newShelfName);
    }
  };

  const addCustomShelf = () => {
    if (newShelfName.trim() && !customShelves.includes(newShelfName)) {
      if (!userId) return;
      createShelfForUser(userId, newShelfName);
      setCustomShelves([...customShelves, newShelfName.trim()]);
      setNewShelfName("");
      setIsAddingShelf(false);
      toast.success("Shelf added successfully!");
    } else {
      toast.error("Invalid shelf name or shelf already exists.");
    }
  };

  const deleteCustomShelf = async (shelfName: string) => {
    if (!userId) return;
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the shelf "${shelfName}"?`
    );

    if (isConfirmed) {
      try {
        const shelfRef = doc(db, "users", userId, "shelves", shelfName);
        await deleteDoc(shelfRef);

        setCustomShelves(customShelves.filter((shelf) => shelf !== shelfName));

        if (selectedShelf === shelfName) {
          setSelectedShelf("Read");
        }

        toast.info("Shelf deleted.");
      } catch (error) {
        console.error("Error deleting shelf:", error);
        toast.error("Failed to delete shelf. Try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center mt-12 w-fit rounded-full bg-brown-500">
        {/* Default Shelves */}
        {["Read", "Currently Reading", "To Read"].map((shelf) => (
          <Link key={shelf} href={`/shelves/${encodeURIComponent(shelf)}`}>
            <p
              className={`text-lg px-12 py-4 cursor-pointer rounded-full ${
                selectedShelf === shelf
                  ? "bg-orange-300 text-brown-700"
                  : "text-brown-100"
              }`}
              onClick={() => setSelectedShelf(shelf)}
            >
              {shelf}
            </p>
          </Link>
        ))}
      </div>
      <button
        onClick={() => setIsAddingShelf(!isAddingShelf)}
        className="text-brown-100 px-4 py-4 hover:text-orange-300"
      >
        <FaPlus size={20} />
      </button>
      {isAddingShelf && (
        <div className="flex items-center mt-4 text-brown-100">
          <input
            type="text"
            value={newShelfName}
            onChange={(e) => setNewShelfName(e.target.value)}
            placeholder="New shelf name"
            className="px-3 py-2 border rounded-l-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <button
            onClick={addCustomShelf}
            className="px-4 py-2 bg-orange-300 text-white rounded-r-md hover:bg-orange-400"
          >
            Add
          </button>
        </div>
      )}

      {/* Display Custom Shelves */}
      <div className="flex flex-wrap gap-4 mt-8 items-center justify-center">
        {customShelves
          .sort((a, b) => a.localeCompare(b))
          .map((shelf) => (
            <div
              key={shelf}
              className="flex items-center w-fit rounded-full bg-brown-500"
            >
              <Link
                href={`/shelves/${encodeURIComponent(shelf)}`}
                className={`flex px-8 rounded-full text-lg py-3 cursor-pointer ${
                  selectedShelf === shelf
                    ? "bg-orange-300 text-brown-700"
                    : "text-brown-100"
                }`}
                onClick={() => setSelectedShelf(shelf)}
              >
                <p className="whitespace-nowrap">{shelf}</p>
                {selectedShelf === shelf && (
                  <button
                    onClick={() => deleteCustomShelf(shelf)}
                    className={`ml-2 text-brown-100 hover:text-red-700 ${
                      selectedShelf === shelf
                        ? "bg-orange-300 text-brown-700"
                        : "text-brown-100"
                    }`}
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </Link>
            </div>
          ))}
      </div>

      {/* Shelf Display Component */}
      <ShelfDisplay
        shelfName={selectedShelf}
        books={books}
        handleUpdateBook={handleUpdateBook}
      />
      <ToastContainer />
    </div>
  );
};

export default ShelvesMenu;
